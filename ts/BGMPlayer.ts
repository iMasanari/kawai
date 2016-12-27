namespace BGMPlayer {
    export interface Controler {
        source: AudioBufferSourceNode
        gain: AudioParam
    }
}

class BGMPlayer {
    context = new (window.AudioContext || window.webkitAudioContext)()
    bufferList: { [name: string]: AudioBuffer } = {}
    playinglist: { [name: string]: BGMPlayer.Controler } = {}
    playing: string | null = null
    isTouchStart = false

    loadAll(playlist: string[], callback?: Function) {
        let loadingCounter = 0
        const loaded = () => {
            if (!--loadingCounter && callback) callback()
        }

        for (const url of playlist) {
            ++loadingCounter
            this.load(url, loaded)
        }
    }

    load(url: string, callback?: Function) {
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
        if (this.playinglist[url]) {
            this.playinglist[url].source.stop()
        }

        const source = this.context.createBufferSource()
        const gainNode = this.context.createGain()

        source.buffer = this.bufferList[url]
        source.loop = true
        gainNode.gain.value = 0

        source.connect(gainNode)
        gainNode.connect(this.context.destination)

        return {
            source: source,
            gain: gainNode.gain
        }
    }
    start(isUserEvent?: boolean) {
        this.context.createBufferSource().start()

        if (!isUserEvent && !this.isTouchStart) {
            this.isTouchStart = true
            document.addEventListener('touchstart', this.mobilestart)
        }
    }
    mobilestart = (e: Event) => {
        document.removeEventListener(e.type, this.mobilestart)
        this.start()
    }
    play(name: string) {
        this.end()

        this.playing = name

        if (!this.playinglist[name]) {
            this.playing = name
            this.playinglist[name] = this.getControler(name)
            this.playinglist[name].source.start(this.context.currentTime)
        }
        this.playinglist[name].gain.value = 1
    }
    end() {
        const ref = this.playinglist[this.playing!]
        if (ref) {
            ref.gain.value = 0
        }

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
