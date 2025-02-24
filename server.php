<?php
session_start();
header('Content-Type: application/json');
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: DENY');
header('X-XSS-Protection: 1; mode=block');

// Initialize storage in session if not exists
if (!isset($_SESSION['quizzes'])) {
    $_SESSION['quizzes'] = [];
    $_SESSION['quiz_results'] = [];
    $_SESSION['current_quiz_id'] = 1;
    $_SESSION['current_result_id'] = 1;
}

// Helper function to generate quiz using Gemini API
function generateQuiz($topic) {
    $PROMPT_TEMPLATE = <<<EOT
Create a comprehensive quiz for UPSC exam preparation on the topic: {topic}
Generate 15 multiple choice questions, returning ONLY the JSON data without any markdown formatting or backticks. The response should be exactly in this format:
{
  "questions": [
    {
      "question": "detailed question text",
      "options": ["option1", "option2", "option3", "option4"],
      "correctAnswer": 0,
      "explanation": "detailed explanation of why this answer is correct"
    }
  ]
}
EOT;

    try {
        $prompt = str_replace('{topic}', $topic, $PROMPT_TEMPLATE);
        
        $curl = curl_init();
        curl_setopt_array($curl, [
            CURLOPT_URL => 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent',
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_POST => true,
            CURLOPT_HTTPHEADER => [
                'Content-Type: application/json',
                'x-goog-api-key: ' . getenv('GEMINI_API_KEY')
            ],
            CURLOPT_POSTFIELDS => json_encode([
                'contents' => [
                    ['parts' => [['text' => $prompt]]]
                ]
            ])
        ]);

        $response = curl_exec($curl);
        $err = curl_error($curl);
        curl_close($curl);

        if ($err) {
            throw new Exception("cURL Error: " . $err);
        }

        $result = json_decode($response, true);
        if (!isset($result['candidates'][0]['content']['parts'][0]['text'])) {
            throw new Exception("Invalid API response format");
        }

        $text = $result['candidates'][0]['content']['parts'][0]['text'];
        // Clean response from markdown formatting
        $text = preg_replace('/```(json|JSON)?\n?/', '', $text);
        $text = str_replace('```', '', $text);
        $text = trim($text);

        $content = json_decode($text, true);
        if (!isset($content['questions']) || !is_array($content['questions'])) {
            throw new Exception("Invalid response format: missing questions array");
        }

        foreach ($content['questions'] as $index => $q) {
            if (!isset($q['question']) || !isset($q['options']) || !is_array($q['options']) || 
                count($q['options']) !== 4 || !isset($q['correctAnswer']) || !isset($q['explanation'])) {
                throw new Exception("Invalid question format at index " . $index);
            }
        }

        return $content;
    } catch (Exception $e) {
        error_log("Error generating quiz: " . $e->getMessage());
        throw $e;
    }
}

// Router
$request_method = $_SERVER['REQUEST_METHOD'];
$request_uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

// Handle static files
if ($request_method === 'GET' && ($request_uri === '/' || $request_uri === '/index.html')) {
    header('Content-Type: text/html');
    readfile('public/index.html');
    exit;
}

// API Routes
try {
    if ($request_uri === '/api/quizzes') {
        if ($request_method === 'POST') {
            $json = file_get_contents('php://input');
            $data = json_decode($json, true);
            
            if (!isset($data['topic'])) {
                throw new Exception("Topic is required", 400);
            }

            $response = generateQuiz($data['topic']);
            $quiz = [
                'id' => $_SESSION['current_quiz_id']++,
                'topic' => $data['topic'],
                'questions' => $response['questions']
            ];
            
            $_SESSION['quizzes'][$quiz['id']] = $quiz;
            echo json_encode($quiz);
        }
    }
    elseif (preg_match('/^\/api\/quizzes\/(\d+)$/', $request_uri, $matches)) {
        if ($request_method === 'GET') {
            $id = (int)$matches[1];
            if (!isset($_SESSION['quizzes'][$id])) {
                throw new Exception("Quiz not found", 404);
            }
            echo json_encode($_SESSION['quizzes'][$id]);
        }
    }
    elseif ($request_uri === '/api/quiz-results') {
        if ($request_method === 'POST') {
            $json = file_get_contents('php://input');
            $data = json_decode($json, true);
            
            $result = [
                'id' => $_SESSION['current_result_id']++,
                'quizId' => $data['quizId'],
                'score' => $data['score'],
                'totalQuestions' => $data['totalQuestions'],
                'answers' => $data['answers']
            ];
            
            $_SESSION['quiz_results'][$result['id']] = $result;
            echo json_encode($result);
        }
    }
    elseif (preg_match('/^\/api\/quiz-results\/(\d+)$/', $request_uri, $matches)) {
        if ($request_method === 'GET') {
            $quizId = (int)$matches[1];
            $result = null;
            foreach ($_SESSION['quiz_results'] as $r) {
                if ($r['quizId'] === $quizId) {
                    $result = $r;
                    break;
                }
            }
            if (!$result) {
                throw new Exception("Quiz result not found", 404);
            }
            echo json_encode($result);
        }
    }
    else {
        throw new Exception("Not found", 404);
    }
} catch (Exception $e) {
    $status_code = $e->getCode() ?: 500;
    http_response_code($status_code);
    echo json_encode(['message' => $e->getMessage()]);
}
?>
