from dataclasses import dataclass, field


@dataclass
class ChangeReport:
    """Summary of the working tree, rendered by the telemetry panel."""

    staged: int = 0
    unstaged: int = 0
    untracked: list[str] = field(default_factory=list)

    @property
    def total(self) -> int:
        return self.staged + self.unstaged + len(self.untracked)

    def summary(self) -> str:
        if self.total == 0:
            return "clean"
        return f"{self.staged} staged / {self.unstaged} unstaged / {len(self.untracked)} untracked"
