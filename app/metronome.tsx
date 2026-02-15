import { useEffect, useRef, useState } from 'react'

import { Button } from './components/ui/button'
import { Input } from './components/ui/input'
import { Switch } from './components/ui/switch'
import { cn } from './lib/utils'

type MetronomeProps = {
  isPlaying: boolean
  className?: string
}

export function Metronome({ isPlaying, className }: MetronomeProps) {
  const [enabled, setEnabled] = useState(false)
  const [bpm, setBpm] = useState(120)

  const audioCtxRef = useRef<AudioContext | null>(null)
  const tapTimesRef = useRef<number[]>([])

  useEffect(() => {
    audioCtxRef.current = new AudioContext()

    return () => {
      audioCtxRef.current?.close()
    }
  }, [])

  const ensureAudioContext = async () => {
    const ctx = audioCtxRef.current
    if (!ctx) return

    if (ctx.state === 'suspended') {
      await ctx.resume()
    }
  }

  const playClick = (time: number, accent = false) => {
    const ctx = audioCtxRef.current
    if (!ctx) return

    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = 'square'
    osc.frequency.value = accent ? 1400 : 1000

    gain.gain.setValueAtTime(accent ? 0.3 : 0.2, time)
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.05)

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.start(time)
    osc.stop(time + 0.05)
  }

  // scheduler
  useEffect(() => {
    if (!enabled || !isPlaying) return

    const ctx = audioCtxRef.current
    if (!ctx) return

    ensureAudioContext()

    let nextNoteTime = ctx.currentTime
    const interval = 60 / bpm
    let beat = 0

    const timer = setInterval(() => {
      while (nextNoteTime < ctx.currentTime + 0.1) {
        // accent no beat 1
        playClick(nextNoteTime, beat % 4 === 0)

        beat++
        nextNoteTime += interval
      }
    }, 25)

    return () => clearInterval(timer)
  }, [enabled, bpm, isPlaying])

  // TAP TEMPO
  const handleTapTempo = () => {
    const now = performance.now()

    if (
      tapTimesRef.current.length &&
      now - tapTimesRef.current.at(-1)! > 2000
    ) {
      tapTimesRef.current = []
    }

    tapTimesRef.current.push(now)

    if (tapTimesRef.current.length > 4) {
      tapTimesRef.current.shift()
    }

    if (tapTimesRef.current.length >= 2) {
      const intervals: number[] = []

      for (let i = 1; i < tapTimesRef.current.length; i++) {
        intervals.push(tapTimesRef.current[i] - tapTimesRef.current[i - 1])
      }

      const avg = intervals.reduce((a, b) => a + b, 0) / intervals.length

      const newBpm = Math.round(60000 / avg)

      if (newBpm >= 40 && newBpm <= 240) {
        setBpm(newBpm)
      }
    }
  }

  return (
    <div className={cn('flex items-center gap-4', className)}>
      <div className="flex items-center gap-2">
        <Switch checked={enabled} onCheckedChange={setEnabled} />
        <span className="text-sm">Metronome</span>
      </div>

      {/* BPM */}
      <div className="flex items-center gap-2">
        <span className="text-sm">BPM</span>
        <Input
          type="number"
          value={bpm}
          min={40}
          max={240}
          className="w-20"
          onChange={(e) => {
            const value = Math.min(240, Math.max(40, Number(e.target.value)))
            setBpm(value)
          }}
        />
      </div>

      {/* Tap tempo */}
      <Button variant="outline" onClick={handleTapTempo}>
        Tap
      </Button>
    </div>
  )
}
