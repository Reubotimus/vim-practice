"use client"
import { dracula } from "@uiw/codemirror-theme-dracula"
import CodeMirror, { type ReactCodeMirrorRef } from "@uiw/react-codemirror"
import { vim } from "@replit/codemirror-vim"
import type { EditorView } from "@codemirror/view"
import { EditorSelection } from "@codemirror/state"
import { type JSX, useEffect, useRef, useState } from "react"
import { uploadResult } from "../uploadResult"
import { Lesson } from "../lessonManifest"
import Link from "next/link"

export default function VimText({
    lesson,
    nextLesson,
    bestScore,
}: {
    lesson: Lesson
    nextLesson: string
    bestScore: number | null
}): JSX.Element {
    const containerRef = useRef<HTMLDivElement | null>(null)
    const editorRef = useRef<ReactCodeMirrorRef | null>(null)
    const [solutionFound, setSolutionFound] = useState<boolean>(false)
    const [keystrokes, setKeystrokes] = useState<number>(0)
    const [currentText, setCurrentText] = useState<string>(
        lesson.initialCode + "\n\n\n\n\n"
    )
    const [currentBestScore, setCurrentBestScore] = useState<number | null>(
        bestScore
    )
    // State for left column (text) width in pixels
    const [leftWidth, setLeftWidth] = useState<number>(300)

    const MIN_LEFT_WIDTH = 150
    const MIN_CODE_WIDTH = 200
    const startPosition = 0

    async function winLesson() {
        setSolutionFound(true)
        await uploadResult({ lessonName: lesson.slug, score: keystrokes })
        if (!currentBestScore || keystrokes < currentBestScore) {
            setCurrentBestScore(keystrokes)
        }
        restart()
    }

    const handleChange = async (value: string): Promise<void> => {
        setCurrentText(value)
        if (value.trim() === lesson.finalCode.trim()) {
            winLesson()
        } else if (solutionFound === true) {
            setSolutionFound(false)
        }
    }

    const restart = (): void => {
        setCurrentText(lesson.initialCode + "\n\n\n\n\n")
        setKeystrokes(0)
        setSolutionFound(false)
        if (editorRef.current?.view) {
            editorRef.current.view.dispatch({
                selection: EditorSelection.single(startPosition),
            })
            editorRef.current.view.focus()
        }
    }

    useEffect(() => {
        const timer = setTimeout(() => {
            if (editorRef.current?.view) {
                editorRef.current.view.focus()
                editorRef.current.view.dispatch({
                    selection: EditorSelection.single(startPosition),
                })
            }
        }, 0)
        return () => clearTimeout(timer)
    }, [lesson.initialCode, startPosition])

    useEffect(() => {
        let handleKeyDown: () => void
        const timer = setTimeout(() => {
            const view: EditorView | undefined = editorRef.current?.view
            if (view) {
                handleKeyDown = () => {
                    setKeystrokes((prev) => prev + 1)
                }
                view.dom.addEventListener("keydown", handleKeyDown, true)
            }
        }, 0)
        return () => {
            clearTimeout(timer)
            const view: EditorView | undefined = editorRef.current?.view
            if (view && handleKeyDown) {
                view.dom.removeEventListener("keydown", handleKeyDown, true)
            }
        }
    }, [])

    // Handler for starting the drag on the divider
    const handleMouseDown = (event: React.MouseEvent<HTMLDivElement>) => {
        event.preventDefault()
        const container = containerRef.current
        if (!container) return

        const containerRect = container.getBoundingClientRect()

        const onMouseMove = (e: MouseEvent) => {
            let newWidth = e.clientX - containerRect.left
            // Clamp width between MIN_LEFT_WIDTH and container width minus MIN_CODE_WIDTH
            if (newWidth < MIN_LEFT_WIDTH) newWidth = MIN_LEFT_WIDTH
            if (newWidth > containerRect.width - MIN_CODE_WIDTH)
                newWidth = containerRect.width - MIN_CODE_WIDTH
            setLeftWidth(newWidth)
        }

        const onMouseUp = () => {
            window.removeEventListener("mousemove", onMouseMove)
            window.removeEventListener("mouseup", onMouseUp)
        }

        window.addEventListener("mousemove", onMouseMove)
        window.addEventListener("mouseup", onMouseUp)
    }

    return (
        <div ref={containerRef} className="mx-auto w-full px-4 max-w-full">
            <div className="flex flex-col items-center py-2">
                <h1 className="text-2xl font-bold text-[#F8F8F2] text-center md:text-left text-center">
                    {lesson.lessonName}
                </h1>
                <div className="flex justify-center md:justify-start gap-2 mt-4">
                    <Link
                        className="px-4 py-2 bg-[#6272A4] text-white rounded hover:bg-[#8BE9FD] transition-colors"
                        href={`/${nextLesson}`}
                    >
                        Next
                    </Link>
                    <button
                        className="px-4 py-2 bg-[#6272A4] text-white rounded hover:bg-[#8BE9FD] transition-colors"
                        onClick={restart}
                    >
                        Restart
                    </button>
                </div>
            </div>
            <div className="flex flex-col md:flex-row">
                {/* Text Column (left) */}
                <div className="space-y-4" style={{ width: leftWidth }}>
                    <h2 className="text-xl font-semibold text-[#F8F8F2] mb-2">
                        Best Score: {currentBestScore ? currentBestScore : "\u221E"}
                    </h2>
                    <div className="p-4 rounded-md bg-[#44475a] text-center md:text-left">
                        <h2 className="text-xl font-semibold text-[#F8F8F2] mb-2">
                            Technique Explanation
                        </h2>
                        <p className="text-[#F8F8F2]">
                            {lesson.techniqueExplanation}
                        </p>
                    </div>
                    <div className="p-4 rounded-md bg-[#44475a] text-center md:text-left">
                        <h2 className="text-xl font-semibold text-[#F8F8F2] mb-2">
                            Instructions
                        </h2>
                        <p className="text-[#F8F8F2]">
                            {lesson.codeInstructions}
                        </p>
                    </div>
                </div>
                {/* Draggable Divider */}
                <div
                    className="w-1 mx-1 cursor-ew-resize bg-[#6272A4]"
                    onMouseDown={handleMouseDown}
                />
                {/* Code Column (right) */}
                <div className="flex-1 pl-2">
                    <div className="flex flex-col items-center md:items-start space-y-4 items-center justify-center">
                        <p className="text-[#F8F8F2] text-center md:text-left">
                            Keystrokes: {keystrokes}
                        </p>
                        <div className="w-full">
                            <CodeMirror
                                ref={editorRef}
                                value={currentText}
                                theme={dracula}
                                extensions={[vim()]}
                                onChange={handleChange}
                            />
                        </div>

                    </div>
                </div>
            </div>
        </div>
    )
}