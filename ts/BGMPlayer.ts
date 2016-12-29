namespace BGMPlayer {
    export interface Controler {
        source: AudioBufferSourceNode
        gain: AudioParam
    }
}

class BGMPlayer {
    context = new (window.AudioContext || window.webkitAudioContext)()
    bufferList: { [name: string]: AudioBuffer } = {}
    playing: BGMPlayer.Controler | null = null
    startTime = 0

    load(url: string, callback?: () => any) {
        // キャッシュをチェック
        if (this.bufferList[url]) {
            if (callback) requestAnimationFrame(callback)
            return
        }

        const xhr = new XMLHttpRequest()

        xhr.open('GET', url)
        xhr.responseType = 'arraybuffer'

        xhr.onload = () => {
            this.context.decodeAudioData(xhr.response, buffer => {
                this.bufferList[url] = buffer

                if (callback) callback()
            })
        }

        xhr.send()
    }
    getControler(url: string): BGMPlayer.Controler {
        const source = this.context.createBufferSource()
        const gainNode = this.context.createGain()

        source.buffer = this.bufferList[url]
        source.loop = true

        source.connect(gainNode)
        gainNode.connect(this.context.destination)

        return {
            source: source,
            gain: gainNode.gain
        }
    }
    start(isUserEvent?: boolean) {
        this.context.createBufferSource().start()

        if (!isUserEvent) {
            const mobilestart = (e: Event) => {
                document.removeEventListener(e.type, mobilestart)
                this.start(true)
            }

            document.addEventListener('touchstart', mobilestart)
        }
    }
    setStartTime() {
        this.startTime = this.context.currentTime
    }
    play(name: string) {
        this.stop()

        const offsetTime = (this.context.currentTime - this.startTime) % this.bufferList[name].duration;

        this.playing = this.getControler(name)
        this.playing.source.start(0, offsetTime)
    }
    stop() {
        if (this.playing) this.playing.source.stop()

        this.playing = null
    }
}

interface Window {
    AudioContext: {
        new (): AudioContext;
        prototype: AudioContext;
    }
    webkitAudioContext: {
        new (): AudioContext;
        prototype: AudioContext;
    }
}
