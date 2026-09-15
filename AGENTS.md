# Agent rules

## Windows background runtime
Any future autonomous/background helper must run without opening a console window. Prefer windowless launchers and no-window child-process flags on Windows; keep visible consoles only for deliberately interactive developer commands. Never terminate Desktop Commander during window cleanup. See `..\BACKGROUND_RUNTIME_POLICY.md`.