#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <libpq-fe.h>
#include <sys/time.h>
#include <unistd.h>
#include <ctype.h>
#include <sys/select.h>

// ==== STRUCTURES ====
typedef struct Question {
    int id;
    char type[50];
    char question[512];
    char options[4][256];
    char correct_answer[256];
    int timer;
    struct Question *left, *right;
} Question;

typedef struct QueueNode {
    Question *question;
    struct QueueNode *next;
} QueueNode;

typedef struct {
    QueueNode *front, *rear;
} Queue;

// ==== GLOBALS ====
Question *questionRoot = NULL;
Queue *quizQueue;
PGconn *conn;

// ==== FUNCTION DECLARATIONS ====
void connectDB(void);
void loadQuestionsFromDB(void);
void freeQuestions(Question *root);
void freeQueue(Queue *q);
int getInputWithTimeout(char *input, int timeout);
void runQuiz(const char *userId);
void showUserScore(void);

Question* createQuestion(int id, char *type, char *ques, char options[][256], char *correct, int timer);
Question* insertQuestion(Question *root, Question *newQ);
void enqueue(Queue *q, Question *question);

// ==== DATABASE CONNECTION ====
void connectDB(void) {
    const char *conninfo = "dbname=quizdb user=postgres password=jaishreeram host=localhost port=5432";
    conn = PQconnectdb(conninfo);
    if (PQstatus(conn) != CONNECTION_OK) {
        fprintf(stderr, "Connection to database failed: %s\n", PQerrorMessage(conn));
        exit(EXIT_FAILURE);
    }
    printf("Connected to PostgreSQL.\n");
}

// ==== BST AND QUEUE ====
Question* createQuestion(int id, char *type, char *ques, char options[][256], char *correct, int timer) {
    Question *q = (Question*)malloc(sizeof(Question));
    int i;
    q->id = id;
    strcpy(q->type, type);
    strcpy(q->question, ques);
    for (i = 0; i < 4; i++) {
        strcpy(q->options[i], options[i]);
    }
    strcpy(q->correct_answer, correct);
    q->timer = timer;
    q->left = q->right = NULL;
    return q;
}

Question* insertQuestion(Question *root, Question *newQ) {
    if (!root) return newQ;
    if (newQ->id < root->id)
        root->left = insertQuestion(root->left, newQ);
    else
        root->right = insertQuestion(root->right, newQ);
    return root;
}

void enqueue(Queue *q, Question *question) {
    QueueNode *node = (QueueNode*)malloc(sizeof(QueueNode));
    node->question = question;
    node->next = NULL;
    if (!q->rear) q->front = q->rear = node;
    else {
        q->rear->next = node;
        q->rear = node;
    }
}

// ==== LOAD QUESTIONS ====
void loadQuestionsFromDB(void) {
    PGresult *res;
    const char *query = "SELECT id, type, question, option_a, option_b, option_c, option_d, correct_answer, timer FROM quiz_questions";
    char options[4][256];
    int rows, i, j;
    Question *q;

    res = PQexec(conn, query);
    if (PQresultStatus(res) != PGRES_TUPLES_OK) {
        fprintf(stderr, "Query failed: %s\n", PQerrorMessage(conn));
        PQclear(res);
        return;
    }

    rows = PQntuples(res);
    for (i = 0; i < rows; i++) {
        for (j = 0; j < 4; j++) {
            strcpy(options[j], PQgetvalue(res, i, j + 3));
        }

        q = createQuestion(
            atoi(PQgetvalue(res, i, 0)),
            (char*)PQgetvalue(res, i, 1),
            (char*)PQgetvalue(res, i, 2),
            options,
            (char*)PQgetvalue(res, i, 7),
            atoi(PQgetvalue(res, i, 8))
        );

        questionRoot = insertQuestion(questionRoot, q);
        enqueue(quizQueue, q);
    }

    PQclear(res);
}

// ==== FREE MEMORY ====
void freeQuestions(Question *root) {
    if (root) {
        freeQuestions(root->left);
        freeQuestions(root->right);
        free(root);
    }
}

void freeQueue(Queue *q) {
    QueueNode *current = q->front;
    QueueNode *temp;
    while (current) {
        temp = current;
        current = current->next;
        free(temp);
    }
}

// ==== INPUT WITH COUNTDOWN TIMEOUT ====
int getInputWithTimeout(char *input, int timeout) {
    fd_set set;
    struct timeval tv;
    int rv;
    int time_left = timeout;
    int input_ready = 0;

    while (time_left > 0) {
        FD_ZERO(&set);
        FD_SET(STDIN_FILENO, &set);

        tv.tv_sec = 1;
        tv.tv_usec = 0;

        rv = select(STDIN_FILENO + 1, &set, NULL, NULL, &tv);
        if (rv == -1) {
            perror("select");
            return 0;
        } else if (rv == 0) {
            printf("\rTime left: %2d sec  ", time_left - 1);
            fflush(stdout);
            time_left--;
        } else {
            if (fgets(input, 256, stdin) == NULL) {
                input[0] = '\0';
                return 0;
            }
            input[strcspn(input, "\n")] = '\0';
            input_ready = 1;
            break;
        }
    }

    if (!input_ready) {
        printf("\nTime's up!\n");
        input[0] = '\0';
        return 0;
    }

    printf("\n");
    return 1;
}

// ==== RUN QUIZ ====
void runQuiz(const char *userId) {
    QueueNode *node = quizQueue->front;
    char answer[256], correctLower[256], answerLower[256];
    PGresult *res;
    char query[1024];
    int i, isCorrect;

    while (node) {
        Question *q = node->question;

        printf("\nQ%d: %s\n", q->id, q->question);
        for (i = 0; i < 4; i++)
            printf("%c. %s\n", 'A' + i, q->options[i]);

        printf("You have %d seconds to answer.\nAnswer: ", q->timer);
        fflush(stdout);

        if (!getInputWithTimeout(answer, q->timer)) {
            strcpy(answer, "");
        }

        for (i = 0; q->correct_answer[i]; i++)
            correctLower[i] = tolower(q->correct_answer[i]);
        correctLower[i] = '\0';

        for (i = 0; answer[i]; i++)
            answerLower[i] = tolower(answer[i]);
        answerLower[i] = '\0';

        isCorrect = strcmp(answerLower, correctLower) == 0;

        snprintf(query, sizeof(query),
            "INSERT INTO responses (user_id, question_id, selected_answer, is_correct) VALUES ('%s', %d, '%s', %s)",
            userId, q->id, answer, isCorrect ? "TRUE" : "FALSE");

        res = PQexec(conn, query);
        if (PQresultStatus(res) != PGRES_COMMAND_OK) {
            fprintf(stderr, "Failed to insert response: %s\n", PQerrorMessage(conn));
        } else {
            printf("Answer: %s\n", isCorrect ? "Correct!" : "Incorrect!");
        }

        PQclear(res);
        node = node->next;
    }
}

// ==== VIEW USER SCORE ====
void showUserScore() {
    char userId[50];
    PGresult *res;
    char query[256];

    printf("Enter User ID to check score: ");
    fgets(userId, sizeof(userId), stdin);
    userId[strcspn(userId, "\n")] = '\0';

    snprintf(query, sizeof(query),
        "SELECT COUNT(*) FROM responses WHERE user_id = '%s' AND is_correct = TRUE", userId);
    res = PQexec(conn, query);

    if (PQresultStatus(res) != PGRES_TUPLES_OK) {
        fprintf(stderr, "Failed to fetch score: %s\n", PQerrorMessage(conn));
        PQclear(res);
        return;
    }

    printf("Total Correct Answers for User '%s': %s\n", userId, PQgetvalue(res, 0, 0));
    PQclear(res);
}

// ==== MAIN ====
int main(int argc, char *argv[]) {
    char userId[50], password[50];
    PGresult *res;
    char query[256];

    connectDB();

    if (argc == 2 && strcmp(argv[1], "score") == 0) {
        showUserScore();
        PQfinish(conn);
        return 0;
    }

    quizQueue = (Queue*)malloc(sizeof(Queue));
    quizQueue->front = quizQueue->rear = NULL;

    printf("User Login\n");
    printf("Enter User ID: ");
    fgets(userId, sizeof(userId), stdin);
    userId[strcspn(userId, "\n")] = '\0';

    printf("Enter Password: ");
    fgets(password, sizeof(password), stdin);
    password[strcspn(password, "\n")] = '\0';

    snprintf(query, sizeof(query),
        "SELECT user_id FROM users WHERE user_id = '%s' AND password = '%s'",
        userId, password);

    res = PQexec(conn, query);
    if (PQresultStatus(res) != PGRES_TUPLES_OK || PQntuples(res) == 0) {
        printf("Invalid user ID or password.\n");
        PQclear(res);
        PQfinish(conn);
        exit(1);
    }

    strncpy(userId, PQgetvalue(res, 0, 0), sizeof(userId));
    userId[sizeof(userId) - 1] = '\0';
    PQclear(res);

    loadQuestionsFromDB();
    runQuiz(userId);

    printf("\nQuiz Completed!\n");

    freeQuestions(questionRoot);
    freeQueue(quizQueue);
    PQfinish(conn);
    return 0;
}
