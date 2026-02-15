import { useKeyPress } from 'ahooks'
import { PauseIcon, PlayIcon } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'

import { useWavesurfer } from '@wavesurfer/react'
import RegionsPlugin from 'wavesurfer.js/dist/plugins/regions.js'

import { Button } from './components/ui/button'
import { Checkbox } from './components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from './components/ui/select'
import { Slider } from './components/ui/slider'

import { Metronome } from './metronome'

type PlayerProps = {
  audioUrl: string
}

export default function Player({ audioUrl }: PlayerProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const activeRegionRef = useRef<any>(null)

  const [volume, setVolume] = useState(1)
  const [speed, setSpeed] = useState('1')
  const [zoom, setZoom] = useState(0)
  const [preservePitch, setPreservePitch] = useState(true)
  const [plugins, setPlugins] = useState<any[]>([])

  useEffect(() => {
    setPlugins([RegionsPlugin.create()])
  }, [])

  const { wavesurfer, isPlaying } = useWavesurfer({
    container: containerRef,
    url: audioUrl,
    height: 120,
    waveColor: 'rgb(200,0,200)',
    progressColor: 'rgb(100,0,100)',
    fillParent: true,
    hideScrollbar: false,
    minPxPerSec: 1,
    plugins
  })

  useEffect(() => {
    if (!wavesurfer || !plugins.length) return

    const regions = plugins[0]

    regions.enableDragSelection({
      color: 'rgba(34, 197, 94, 0.5)'
    })

    const onRegionCreated = (region: any) => {
      if (activeRegionRef.current && activeRegionRef.current !== region) {
        activeRegionRef.current.remove()
      }
      activeRegionRef.current = region
    }

    regions.on('region-created', onRegionCreated)

    const onTimeUpdate = (time: number) => {
      const region = activeRegionRef.current
      if (!region) return

      if (time >= region.end) {
        wavesurfer.setTime(region.start)
      }
    }

    wavesurfer.on('timeupdate', onTimeUpdate)

    return () => {
      regions.un('region-created', onRegionCreated)
      wavesurfer.un('timeupdate', onTimeUpdate)
    }
  }, [wavesurfer, plugins])

  useKeyPress('space', (e) => {
    e.preventDefault()

    const tag = (e.target as HTMLElement)?.tagName
    if (['INPUT', 'TEXTAREA', 'SELECT'].includes(tag)) return

    wavesurfer?.playPause()
  })

  const onPlayPause = useCallback(() => {
    wavesurfer?.playPause()
  }, [wavesurfer])

  return (
    <div className="space-y-4">
      {/* Waveform */}
      <div className="w-full rounded-xl border overflow-hidden h-[135px] flex items-center">
        <div ref={containerRef} className="w-full" />
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-4">
        <Button onClick={onPlayPause} size="icon">
          {isPlaying ? <PauseIcon /> : <PlayIcon />}
        </Button>

        {/* Volume */}
        <div className="w-40 grid gap-1">
          <div>Volume</div>
          <Slider
            value={[volume * 100]}
            max={100}
            onValueChange={(v) => {
              const val = v[0] / 100
              setVolume(val)
              wavesurfer?.setVolume(val)
            }}
          />
        </div>

        {/* Zoom */}
        <div className="w-40 grid gap-1">
          <div>Zoom</div>
          <Slider
            value={[zoom]}
            min={0}
            max={300}
            onValueChange={(v) => {
              const value = v[0]
              setZoom(value)
              wavesurfer?.zoom(value)
            }}
          />
        </div>

        {/* Speed */}
        <Select
          value={speed}
          onValueChange={(value) => {
            setSpeed(value)
            wavesurfer?.setPlaybackRate(Number(value), preservePitch)
          }}
        >
          <SelectTrigger className="w-24">
            <SelectValue />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="0.5">0.5x</SelectItem>
            <SelectItem value="0.75">0.75x</SelectItem>
            <SelectItem value="1">1.0x</SelectItem>
            <SelectItem value="1.25">1.25x</SelectItem>
            <SelectItem value="1.5">1.5x</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex items-center gap-2">
          <Checkbox
            checked={preservePitch}
            onCheckedChange={(v) => setPreservePitch(Boolean(v))}
          />
          <span className="text-sm">Preserve pitch</span>
        </div>
      </div>

      <div className="flex items-center justify-center gap-4">
        <Metronome isPlaying={isPlaying} className="p-4 border rounded-lg" />
      </div>
    </div>
  )
}
