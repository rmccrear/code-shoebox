# Environment: Python (Console)
**ID:** `python`

## Overview
Real Python 3.14 (Pyodide) running in the browser. Output goes to the console.

## Features
- **Language:** Full Python syntax: functions, classes, f-strings, list comprehensions, exceptions, big integers.
- **Standard library:** Most modules work, including `math`, `random`, `json`, `re`, `collections`, `itertools`, `datetime`, `dataclasses`, and `statistics`.
- **Input:** `input()` reads the next line from the **Program input** box above the console. The answer is shown after the prompt, like in a terminal.
- **Fresh start:** Each Run starts with no variables left over from the previous run.

## Output UI
- **Visual:** None.
- **Console:** `print()` output, plus errors that point to lines in `main.py`.
- **Run button:** Shows "LOADING PYTHON…" for a few seconds after the page opens, then RUN CODE. While a program runs it becomes STOP.

## Limitations
- **Packages:** No `pip`, numpy, pandas, or matplotlib.
- **Graphics:** No `turtle` or `tkinter`.
- **Input:** Answers must be typed in the Program input box before pressing Run. If the program asks for more lines than the box has, it stops with an `EOFError`.
- **Time and output limits:** Programs stop after 10 seconds or 5,000 printed lines.
- **Network and browser:** No internet access and no access to the web page.

## LLM Usage Hints
- Use for beginner Python: variables, loops, functions, lists, dictionaries, and string formatting.
- When code calls `input()`, also give the lines to put in the Program input box (one answer per line).
- Keep loops small enough to finish well within 10 seconds.

## Example Code
```python
name = input("What is your name? ")
scores = [7, 9, 8]
print(f"Hi {name}! Your average is {sum(scores) / len(scores):.1f}")
```
Program input:
```text
Ada
```
