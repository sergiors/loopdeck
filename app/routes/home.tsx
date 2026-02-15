import { useEffect, useState } from 'react'
import type { Route } from './+types/home'

import Player from '~/player'

import { Button } from '~/components/ui/button'
import { Card } from '~/components/ui/card'
import { Input } from '~/components/ui/input'

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'LoopDeck' },
    { name: 'description', content: 'Loop. Practice. Master.' }
  ]
}

export default function Home() {
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [audioName, setAudioName] = useState<string>('')

  useEffect(() => {
    return () => {
      if (audioUrl) URL.revokeObjectURL(audioUrl)
    }
  }, [audioUrl])

  const onFileChange = (file?: File) => {
    if (!file) return

    setAudioUrl(URL.createObjectURL(file))
    setAudioName(file.name)
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 space-y-6">
      {!audioUrl ? (
        <div className="flex items-center justify-center min-h-[60vh]">
          <Card className="w-full max-w-lg p-8 text-center space-y-6">
            <div className="space-y-2">
              <h1 className="text-2xl font-semibold tracking-tight">
                Load your track
              </h1>
              <p className="text-sm text-muted-foreground">
                Drop an MP3 or choose a file to start creating practice loops.
              </p>
            </div>

            <div className="space-y-3">
              <Input
                type="file"
                accept="audio/mpeg,audio/mp3"
                onChange={(e) => onFileChange(e.target.files?.[0])}
                className="cursor-pointer"
              />

              <p className="text-xs text-muted-foreground">
                Everything runs locally — nothing is uploaded.
              </p>
            </div>
          </Card>
        </div>
      ) : (
        <>
          {/* Header do arquivo */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Now practicing
              </p>
              <p className="font-medium truncate">{audioName}</p>
            </div>

            <Button
              size="sm"
              variant="outline"
              onClick={() => setAudioUrl(null)}
            >
              Load another track
            </Button>
          </div>

          <Player audioUrl={audioUrl} />
        </>
      )}
    </div>
  )
}
