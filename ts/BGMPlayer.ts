interface BGMControl {
    source: AudioBufferSourceNode
    gain: AudioParam
}

class BGMPlayer {
    context = new (window.AudioContext || window.webkitAudioContext)()

    isntStarted: string[] = []
    playlist: { [name: string]: BGMControl } = {}
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
                const source = this.context.createBufferSource()
                const gainNode = this.context.createGain()

                source.buffer = buffer
                source.loop = true
                gainNode.gain.value = 0

                source.connect(gainNode)
                gainNode.connect(this.context.destination)

                if (!this.playlist[url]) {
                    this.isntStarted.push(url)

                    this.playlist[url] = {
                        source: source,
                        gain: gainNode.gain
                    }
                }
                if (callback) callback()
            })
        }

        xhr.send()
    }
    start(name?: string) {
        for (const value of this.isntStarted) {
            this.playlist[value].source.start()
        }
        this.isntStarted = []

        if (name) {
            this.playlist[name].gain.value = 1
            this.playing = name
        }

        if (!this.isTouchStart) {
            this.isTouchStart = true
            const mobilestart = () => {
                document.removeEventListener('touchstart', mobilestart)
                this.start(name)
            }

            document.addEventListener('touchstart', mobilestart)
        }
    }
    play(name?: string) {
        this.end()

        if (name == null) {
            for (const key in this.playlist) if (this.playlist.hasOwnProperty(key)) {
                name = key
                break
            }
        }

        name = name!

        this.playing = name

        if (this.playlist[name]) {
            // this.playlist[name].source.start()
            this.playlist[name].gain.value = 1
        }
    }
    end() {
        const ref = this.playlist[this.playing!]
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
