'use client';
import { dracula } from "@uiw/codemirror-theme-dracula";
import CodeMirror, { ReactCodeMirrorRef } from '@uiw/react-codemirror';
import { vim } from "@replit/codemirror-vim";
import { EditorView } from "@codemirror/view";
import { EditorSelection } from "@codemirror/state";
import { JSX, useEffect, useRef, useState } from 'react';

export default function VimText({ start, end, startPosition }: { start: string, end: string, startPosition: number }): JSX.Element {
    const editorRef = useRef<ReactCodeMirrorRef | null>(null);
    const [solutionFound, setSolutionFound] = useState<boolean>(false);
    const [keystrokes, setKeystrokes] = useState<number>(0);
    const [currentText, setCurrentText] = useState<string>(start + "\n\n\n\n\n");

    const handleChange = (value: string): void => {
        setCurrentText(value);
        if (value.trim() === end.trim()) {
            setSolutionFound(true);
        } else if (solutionFound === true) {
            setSolutionFound(false);
        }
    };

    // Restart function resets text, keystroke counter, solution flag, and cursor position.
    const restart = (): void => {
        setCurrentText(start + "\n\n\n\n\n");
        setKeystrokes(0);
        setSolutionFound(false);
        if (editorRef.current?.view) {
            editorRef.current.view.dispatch({
                selection: EditorSelection.single(startPosition)
            });
            editorRef.current.view.focus();
        }
    };

    useEffect(() => {
        // Use a timeout to ensure the editor is fully initialized.
        const timer = setTimeout(() => {
            if (editorRef.current?.view) {
                editorRef.current.view.focus();
                editorRef.current.view.dispatch({
                    selection: EditorSelection.single(startPosition)
                });
            }
        }, 0);

        return () => clearTimeout(timer);
    }, [start, startPosition]);

    // Add keystroke counting by attaching a keydown event listener to the editor's DOM element.
    useEffect(() => {
        let handleKeyDown: () => void;
        const timer = setTimeout(() => {
            const view: EditorView | undefined = editorRef.current?.view;
            if (view) {
                handleKeyDown = () => {
                    setKeystrokes(prev => prev + 1);
                };
                view.dom.addEventListener("keydown", handleKeyDown, true);
            }
        }, 0);
        return () => {
            clearTimeout(timer);
            const view: EditorView | undefined = editorRef.current?.view;
            if (view && handleKeyDown) {
                view.dom.removeEventListener("keydown", handleKeyDown, true);
            }
        }
    }, []);

    return (
        <div className="flex-col">
            <h2 className="text-[#F8F8F2] text-center font-bold">
                {solutionFound ? "Solution found!" : "Edit the text to be the same as the left"}
            </h2>
            <p className="text-[#F8F8F2] text-center">Keystrokes: {keystrokes}</p>
            <div className="flex justify-around w-full">
                <CodeMirror
                    ref={editorRef}
                    value={currentText}
                    theme={dracula}
                    extensions={[vim()]}
                    onChange={handleChange}
                />
                <CodeMirror
                    value={end + "\n\n\n\n\n"}
                    theme={dracula}
                    editable={false}
                />
            </div>
            <div className="flex justify-center mt-4">
                <button
                    className="px-4 py-2 bg-blue-500 text-white rounded"
                    onClick={restart}
                >
                    Restart
                </button>
            </div>
        </div>
    );
}
