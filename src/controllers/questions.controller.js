const fs = require('fs').promises;
const path = require('path');

const questionsPath = path.join(__dirname, '../questions.json');

const getQuestions = async (req, res) => {
    try {
        const data = await fs.readFile(questionsPath, 'utf8');
        res.json(JSON.parse(data));
    } catch (error) {
        if (error.code === 'ENOENT') {
            res.json([]);
        } else {
            res.status(500).json({ error: 'Failed to load questions' });
        }
    }
};

const saveQuestion = async (req, res) => {
    try {
        const { question } = req.body;
        const newQuestion = {
            id: Date.now(),
            question,
            answer: null,
            creationDate: new Date().toLocaleString("en-US", { timeZone: "America/New_York"}),
            answeredDate: null
        };

        let questions = [];
        try {
            const data = await fs.readFile(questionsPath, 'utf8');
            questions = JSON.parse(data);
        } catch (error) {
            // File doesn't exist or is empty
        }

        questions.push(newQuestion);
        await fs.writeFile(questionsPath, JSON.stringify(questions, null, 2));
        res.json(newQuestion);
    } catch (error) {
        res.status(500).json({ error: 'Failed to save question' });
    }
};

const updateAnswer = async (req, res) => {
    try {
        const { id } = req.params;
        const { question, answer } = req.body;
        
        const data = await fs.readFile(questionsPath, 'utf8');
        const questions = JSON.parse(data);
        
        const questionIndex = questions.findIndex(q => q.id === parseInt(id));
        if (questionIndex === -1) {
            return res.status(404).json({ error: 'Question not found' });
        }

        // Update question if provided
        if (question && question !== questions[questionIndex].question) {
            questions[questionIndex].question = question;
            // questions[questionIndex].creationDate = new Date().toLocaleString("en-US", { timeZone: "America/New_York"});
        }

        // Update answer if provided
        if (answer !== undefined) {
            questions[questionIndex].answer = answer;
            questions[questionIndex].answeredDate = answer.trim().length > 0 ? 
                new Date().toLocaleString("en-US", { timeZone: "America/New_York"}) : null;
        }
        
        await fs.writeFile(questionsPath, JSON.stringify(questions, null, 2));
        res.json(questions[questionIndex]);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update question/answer' });
    }
};

const deleteQuestion = async (req, res) => {
    try {
        const { id } = req.params;
        const data = await fs.readFile(questionsPath, 'utf8');
        let questions = JSON.parse(data);
        
        questions = questions.filter(q => q.id !== parseInt(id));
        
        await fs.writeFile(questionsPath, JSON.stringify(questions, null, 2));
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete question' });
    }
};

module.exports = { getQuestions, saveQuestion, updateAnswer, deleteQuestion };