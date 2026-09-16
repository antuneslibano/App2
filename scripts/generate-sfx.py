#!/usr/bin/env python3
"""Generates the game's sound effects as small mono WAV files.

The sounds are synthesised from scratch (sine partials + filtered noise with
exponential envelopes) so the repo carries no third-party audio. Re-run with
`python3 scripts/generate-sfx.py` after tweaking any recipe below.
"""

import math
import os
import random
import struct
import wave

SAMPLE_RATE = 22050
OUT_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'assets', 'sfx')

random.seed(7)


def envelope(i, total, attack=0.005, decay=6.0):
    """Short linear attack (kills the click) into an exponential decay."""
    t = i / SAMPLE_RATE
    duration = total / SAMPLE_RATE
    attack_samples = max(1, int(attack * SAMPLE_RATE))
    a = min(1.0, i / attack_samples)
    return a * math.exp(-decay * t / duration)


def sine(freq, i, phase=0.0):
    return math.sin(2 * math.pi * freq * i / SAMPLE_RATE + phase)


def lowpassed_noise(samples, smoothing=0.45):
    """White noise run through a one-pole lowpass so it reads as a 'thud' not a hiss."""
    out = []
    prev = 0.0
    for _ in range(samples):
        n = random.uniform(-1.0, 1.0)
        prev = prev + smoothing * (n - prev)
        out.append(prev)
    return out


def write_wav(name, samples):
    peak = max(abs(s) for s in samples) or 1.0
    path = os.path.join(OUT_DIR, name)
    with wave.open(path, 'w') as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(SAMPLE_RATE)
        frames = b''.join(struct.pack('<h', int(max(-1.0, min(1.0, s / peak * 0.92)) * 32767)) for s in samples)
        w.writeframes(frames)
    print(f'{name}: {len(samples) / SAMPLE_RATE * 1000:.0f}ms, {os.path.getsize(path)} bytes')


def make_tap():
    """Pickaxe hitting rock — the 'tec' that repeats while holding."""
    total = int(0.07 * SAMPLE_RATE)
    noise = lowpassed_noise(total, 0.5)
    out = []
    for i in range(total):
        env = envelope(i, total, attack=0.002, decay=9.0)
        body = 0.55 * sine(190, i) + 0.25 * sine(430, i)
        out.append((body + 0.75 * noise[i]) * env)
    return out


def make_break():
    """Block shattering — noise burst over a falling pitch sweep."""
    total = int(0.2 * SAMPLE_RATE)
    noise = lowpassed_noise(total, 0.7)
    out = []
    for i in range(total):
        t = i / total
        env = envelope(i, total, attack=0.002, decay=5.5)
        freq = 430 * math.exp(-2.2 * t) + 90
        body = 0.7 * sine(freq, i) + 0.3 * sine(freq * 1.5, i)
        out.append((body + 0.85 * noise[i]) * env)
    return out


def make_crit():
    """Critical hit — bright two-tone ding on top of an impact."""
    total = int(0.28 * SAMPLE_RATE)
    noise = lowpassed_noise(int(0.05 * SAMPLE_RATE), 0.8)
    out = []
    for i in range(total):
        env = envelope(i, total, attack=0.003, decay=5.0)
        tone = 0.5 * sine(880, i) + 0.4 * sine(1320, i) + 0.2 * sine(1760, i)
        impact = noise[i] * 0.8 if i < len(noise) else 0.0
        out.append((tone + impact) * env)
    return out


def make_coin():
    """Selling the bag — two quick coin pings."""
    total = int(0.32 * SAMPLE_RATE)
    gap = int(0.06 * SAMPLE_RATE)
    out = []
    for i in range(total):
        first = (0.6 * sine(1180, i) + 0.3 * sine(2360, i)) * envelope(i, total, attack=0.002, decay=9.0)
        second = 0.0
        if i >= gap:
            j = i - gap
            second = (0.6 * sine(1560, j) + 0.3 * sine(3120, j)) * envelope(j, total - gap, attack=0.002, decay=8.0)
        out.append(first + second)
    return out


def make_purchase():
    """Buying something — ascending major triad."""
    notes = [523.25, 659.25, 783.99]
    step = int(0.07 * SAMPLE_RATE)
    total = step * len(notes) + int(0.12 * SAMPLE_RATE)
    out = [0.0] * total
    for n, freq in enumerate(notes):
        start = n * step
        length = total - start
        for j in range(length):
            env = envelope(j, length, attack=0.004, decay=6.5)
            out[start + j] += (0.5 * sine(freq, j) + 0.18 * sine(freq * 2, j)) * env
    return out


def make_ascend():
    """Ascension fanfare — four rising notes with a long tail."""
    notes = [523.25, 659.25, 783.99, 1046.50]
    step = int(0.11 * SAMPLE_RATE)
    total = step * len(notes) + int(0.35 * SAMPLE_RATE)
    out = [0.0] * total
    for n, freq in enumerate(notes):
        start = n * step
        length = total - start
        for j in range(length):
            env = envelope(j, length, attack=0.006, decay=4.0)
            out[start + j] += (0.45 * sine(freq, j) + 0.2 * sine(freq * 2, j) + 0.1 * sine(freq * 3, j)) * env
    return out


RECIPES = {
    'tap.wav': make_tap,
    'break.wav': make_break,
    'crit.wav': make_crit,
    'coin.wav': make_coin,
    'purchase.wav': make_purchase,
    'ascend.wav': make_ascend,
}

if __name__ == '__main__':
    os.makedirs(OUT_DIR, exist_ok=True)
    for filename, recipe in RECIPES.items():
        write_wav(filename, recipe())
