#!/usr/bin/env python3
"""
TokenZip Protocol — CLI Demo
Simulates the speed difference between plain-text transfer and TokenZip.
Run: python3 cli_mock.py
"""

import sys
import time
import shutil

COLS = min(shutil.get_terminal_size().columns, 80)

# ANSI colors
RESET  = "\033[0m"
BOLD   = "\033[1m"
DIM    = "\033[2m"
RED    = "\033[31m"
GREEN  = "\033[32m"
YELLOW = "\033[33m"
BLUE   = "\033[34m"
MAGENTA = "\033[35m"
CYAN   = "\033[36m"
WHITE  = "\033[37m"
BG_GREEN  = "\033[42m"
BG_BLUE   = "\033[44m"
BLACK  = "\033[30m"


def print_banner():
    banner = f"""
{CYAN}{BOLD}╔{'═' * (COLS - 2)}╗
║{' ' * ((COLS - 30) // 2)}TokenZip Protocol — CLI Demo{' ' * ((COLS - 30) // 2 + (COLS - 30) % 2)}║
╚{'═' * (COLS - 2)}╝{RESET}
"""
    print(banner)


def progress_bar(label, total_secs, steps=40, color=GREEN):
    sys.stdout.write(f"  {label}\n")
    for i in range(steps + 1):
        pct = i / steps
        filled = int(pct * 30)
        bar = f"{color}{'█' * filled}{DIM}{'░' * (30 - filled)}{RESET}"
        elapsed = total_secs * pct
        sys.stdout.write(f"\r  [{bar}] {pct * 100:5.1f}%  {elapsed:.1f}s / {total_secs:.1f}s")
        sys.stdout.flush()
        time.sleep(total_secs / steps)
    sys.stdout.write("\n")


def type_print(text, delay=0.02):
    for ch in text:
        sys.stdout.write(ch)
        sys.stdout.flush()
        time.sleep(delay)
    print()


def separator():
    print(f"\n{DIM}{'─' * COLS}{RESET}\n")


def main():
    print_banner()

    # ── Step 1: Plain text transfer (slow) ──
    print(f"  {YELLOW}{BOLD}▸ Method 1: Plain Text Transfer{RESET}")
    print(f"  {DIM}Sending full article as raw tokens to LLM context window...{RESET}\n")

    time.sleep(0.5)
    type_print(f"  {WHITE}Connecting to content provider...{RESET}", 0.03)
    time.sleep(0.3)
    print(f"  {DIM}Source: Wall Street Journal — \"Fed Signals Rate Pause\"{RESET}")
    print(f"  {DIM}Content: 50,000 tokens (≈37,500 words){RESET}\n")

    sys.stdout.write(f"  {RED}{BOLD}Transferring via Plain Text: 50,000 tokens...{RESET}\n")
    progress_bar("", total_secs=15, steps=50, color=RED)

    print(f"\n  {RED}✗ Transfer complete{RESET}")
    print(f"  {DIM}  Time elapsed:  {WHITE}{BOLD}15.0s{RESET}")
    print(f"  {DIM}  Tokens used:   {WHITE}{BOLD}50,000{RESET}")
    print(f"  {DIM}  Transfer cost:  {WHITE}{BOLD}$0.05{RESET}  {DIM}(input token billing){RESET}")
    print(f"  {DIM}  Royalties:     {RED}{BOLD}$0.00{RESET}  {DIM}(no tracking){RESET}")

    separator()

    # ── Step 2: TokenZip transfer (fast) ──
    print(f"  {GREEN}{BOLD}▸ Method 2: TokenZip Protocol{RESET}")
    print(f"  {DIM}Resolving TrexID pointer → local codebook decode...{RESET}\n")

    time.sleep(0.5)
    type_print(f"  {WHITE}Resolving TrexID: {CYAN}Trex-8892{RESET}", 0.03)
    time.sleep(0.2)

    sys.stdout.write(f"\n  {GREEN}{BOLD}Transferring via TokenZip: [ID: Trex-8892]{RESET}")
    sys.stdout.flush()

    frames = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"]
    for i in range(8):
        sys.stdout.write(f"\r  {GREEN}{BOLD}Transferring via TokenZip: [ID: Trex-8892] {frames[i % len(frames)]} {RESET}")
        sys.stdout.flush()
        time.sleep(0.025)

    sys.stdout.write(f"\r  {GREEN}{BOLD}Transferring via TokenZip: [ID: Trex-8892] ... [Done: 0.2s] ✓{RESET}\n")
    sys.stdout.flush()

    time.sleep(0.3)
    print(f"\n  {GREEN}✓ Transfer complete{RESET}")
    print(f"  {DIM}  Time elapsed:  {WHITE}{BOLD}0.2s{RESET}  {GREEN}(75x faster){RESET}")
    print(f"  {DIM}  Tokens sent:   {WHITE}{BOLD}64{RESET}     {GREEN}(99.87% reduction){RESET}")
    print(f"  {DIM}  Transfer cost:  {WHITE}{BOLD}$0.00001{RESET}")
    print(f"  {DIM}  Royalties:     {GREEN}{BOLD}$0.02{RESET}  {DIM}(auto-settled){RESET}")

    separator()

    # ── Step 3: Royalty settlement ──
    print(f"  {MAGENTA}{BOLD}▸ Royalty Settlement via TokenZip Ledger{RESET}\n")
    time.sleep(0.4)

    steps_data = [
        ("Verifying content license...", 0.15),
        ("Computing usage-based royalty...", 0.1),
        ("Signing micro-transaction...", 0.12),
        ("Broadcasting to settlement layer...", 0.08),
    ]

    for label, delay in steps_data:
        type_print(f"  {DIM}  → {label}{RESET}", 0.015)
        time.sleep(delay)

    time.sleep(0.3)
    print()
    print(f"  {BG_GREEN}{BLACK} ✓ SETTLED {RESET} {GREEN}{BOLD}Royalties processed via TokenZip Ledger: +$0.02 to Wall Street Journal{RESET}")
    print()

    separator()

    # ── Summary ──
    print(f"  {BOLD}{WHITE}┌─────────────────────────────────────────────────┐{RESET}")
    print(f"  {BOLD}{WHITE}│  Summary                                        │{RESET}")
    print(f"  {BOLD}{WHITE}├─────────────────────────────────────────────────┤{RESET}")
    print(f"  {BOLD}{WHITE}│  {DIM}Metric          Plain Text    TokenZip{RESET}       {BOLD}{WHITE}│{RESET}")
    print(f"  {BOLD}{WHITE}│  {DIM}──────────────  ──────────    ─────────{RESET}       {BOLD}{WHITE}│{RESET}")
    print(f"  {BOLD}{WHITE}│  {DIM}Latency         {RED}15.0s{RESET}         {GREEN}0.2s{RESET}            {BOLD}{WHITE}│{RESET}")
    print(f"  {BOLD}{WHITE}│  {DIM}Tokens          {RED}50,000{RESET}        {GREEN}64{RESET}              {BOLD}{WHITE}│{RESET}")
    print(f"  {BOLD}{WHITE}│  {DIM}Royalties       {RED}$0.00{RESET}         {GREEN}$0.02{RESET}           {BOLD}{WHITE}│{RESET}")
    print(f"  {BOLD}{WHITE}│  {DIM}Copyright       {RED}None{RESET}          {GREEN}Licensed{RESET}        {BOLD}{WHITE}│{RESET}")
    print(f"  {BOLD}{WHITE}└─────────────────────────────────────────────────┘{RESET}")
    print()


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print(f"\n{DIM}  Interrupted.{RESET}")
        sys.exit(0)
