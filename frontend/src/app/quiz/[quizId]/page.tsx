'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { quizApi } from '@/lib/api';
import { Quiz, QuizResult } from '@/types';
import QuizQuestion from '@/components/QuizQuestion';
import LoadingSpinner from '@/components/LoadingSpinner';
import { ArrowLeft, CheckCircle, XCircle, Award, Loader2 } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function QuizPage() {
    const router = useRouter();
    const params = useParams();
    const quizId = params.quizId as string;
    const { isAuthenticated, isLoading: authLoading, setLoading } = useAuthStore();
    const [quiz, setQuiz] = useState<Quiz | null>(null);
    const [answers, setAnswers] = useState<(number | undefined)[]>([]);
    const [result, setResult] = useState<QuizResult | null>(null);
    const [loading, setLoadingState] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        setLoading(false);
    }, [setLoading]);

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.push('/login');
            return;
        }

        if (isAuthenticated && quizId) {
            fetchQuiz();
        }
    }, [isAuthenticated, authLoading, router, quizId]);

    const fetchQuiz = async () => {
        try {
            const response = await quizApi.get(quizId);
            setQuiz(response.data.data.quiz);
            setAnswers(new Array(response.data.data.quiz.totalQuestions).fill(undefined));
        } catch (error) {
            // Try to get result if quiz is completed
            try {
                const resultResponse = await quizApi.getResult(quizId);
                setResult(resultResponse.data.data.quiz);
            } catch {
                toast.error('Failed to load quiz');
                router.push('/documents');
            }
        } finally {
            setLoadingState(false);
        }
    };

    const handleSelectAnswer = (questionIndex: number, answerIndex: number) => {
        setAnswers(prev => {
            const newAnswers = [...prev];
            newAnswers[questionIndex] = answerIndex;
            return newAnswers;
        });
    };

    const handleSubmit = async () => {
        if (answers.some(a => a === undefined)) {
            toast.error('Please answer all questions');
            return;
        }

        setSubmitting(true);
        try {
            const response = await quizApi.submit(quizId, answers as number[]);
            setResult(response.data.data);
            toast.success('Quiz submitted!');
        } catch (error) {
            toast.error('Failed to submit quiz');
        } finally {
            setSubmitting(false);
        }
    };

    if (authLoading || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    // Show results
    if (result) {
        return (
            <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto">
                    <Link
                        href="/documents"
                        className="inline-flex items-center gap-2 text-dark-400 hover:text-white transition-colors mb-6"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Documents
                    </Link>

                    {/* Score Card */}
                    <div className="bg-dark-800/50 rounded-2xl p-8 border border-dark-700 text-center mb-8">
                        <div className="w-20 h-20 rounded-full bg-gradient-to-r from-primary-500 to-accent-500 flex items-center justify-center mx-auto mb-4">
                            <Award className="w-10 h-10 text-white" />
                        </div>
                        <h1 className="text-3xl font-bold text-white mb-2">Quiz Complete!</h1>
                        <p className="text-dark-400 mb-6">Here&apos;s how you did</p>
                        <div className="flex items-center justify-center gap-8">
                            <div>
                                <p className="text-5xl font-bold gradient-text">{result.score}/{result.totalQuestions}</p>
                                <p className="text-dark-400 mt-1">Correct Answers</p>
                            </div>
                            <div className="w-px h-16 bg-dark-700" />
                            <div>
                                <p className="text-5xl font-bold text-white">{result.percentage}%</p>
                                <p className="text-dark-400 mt-1">Score</p>
                            </div>
                        </div>
                    </div>

                    {/* Results */}
                    <h2 className="text-xl font-semibold text-white mb-4">Question Results</h2>
                    <div className="space-y-6">
                        {result.results.map((r, index) => (
                            <QuizQuestion
                                key={index}
                                questionNumber={index + 1}
                                question={r.question}
                                options={r.options}
                                selectedAnswer={r.userAnswer}
                                correctAnswer={r.correctAnswer}
                                showResult={true}
                                explanation={r.explanation}
                            />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (!quiz) return null;

    const answeredCount = answers.filter(a => a !== undefined).length;

    return (
        <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-white">{quiz.title}</h1>
                    <p className="text-dark-400 mt-1">
                        Answer all {quiz.totalQuestions} questions to complete the quiz
                    </p>
                </div>

                {/* Progress */}
                <div className="mb-6">
                    <div className="flex items-center justify-between text-sm text-dark-400 mb-2">
                        <span>{answeredCount} of {quiz.totalQuestions} answered</span>
                    </div>
                    <div className="h-2 bg-dark-700 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-primary-500 to-accent-500 transition-all duration-300"
                            style={{ width: `${(answeredCount / quiz.totalQuestions) * 100}%` }}
                        />
                    </div>
                </div>

                {/* Questions */}
                <div className="space-y-6">
                    {quiz.questions.map((q, index) => (
                        <QuizQuestion
                            key={index}
                            questionNumber={index + 1}
                            question={q.question}
                            options={q.options}
                            selectedAnswer={answers[index]}
                            onSelect={(answerIndex) => handleSelectAnswer(index, answerIndex)}
                        />
                    ))}
                </div>

                {/* Submit */}
                <div className="mt-8 flex justify-center">
                    <button
                        onClick={handleSubmit}
                        disabled={submitting || answeredCount < quiz.totalQuestions}
                        className="btn-primary flex items-center gap-2 px-8"
                    >
                        {submitting ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Submitting...
                            </>
                        ) : (
                            <>
                                <CheckCircle className="w-5 h-5" />
                                Submit Quiz
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
