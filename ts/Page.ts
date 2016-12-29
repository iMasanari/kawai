namespace Page {
    export interface Data {
        offset: number
        el: HTMLElement
        img: HTMLImageElement
        play: () => void
    }
}

class Page {
    private active = 0
    private sceneHash = 0
    private resizeTimer: number | undefined

    offsetList: Page.Data[] = []

    constructor(public el: HTMLElement, public bgm: BGMPlayer) {
        window.addEventListener('scroll', this.scroll, false)
        window.addEventListener('resize', this.delayResize, false)
    }

    createScene(dataList: PageData[], callback: () => any) {
        const sceneHash = this.sceneHash

        const settingFirstPage = (data: Page.Data) => {
            this.bgm.setStartTime()
            data.play()

            // スクロールするまで描画されないバグの回避
            if ((document.documentElement.scrollTop || document.body.scrollTop) == 0) {
                window.scrollBy(0, 0.1)
            }
        }

        const len = dataList.length
        const loop = (i: number) => {
            this.createPage(dataList[i], data => {
                // `.clear()`されていた場合は何もしない
                if (sceneHash != this.sceneHash) return

                if (i === 0) settingFirstPage(data)

                this.el.appendChild(data.el)
                data.offset = data.img.offsetTop
                this.offsetList.push(data)

                if (i + 1 < len) {
                    loop(i + 1)
                }
                else {
                    callback()
                }
            })
        }

        loop(0)
    }

    createPage(data: PageData, callback?: (res: Page.Data) => any) {
        const img = new Image()
        const el = document.createElement('li')
        const loader = Loader(() => {
            if (callback) {
                callback({ el, img, play: () => { this.bgm.play(data.sound) }, offset: 0 })
            }
        })

        this.bgm.load(data.sound, loader.callback())

        // img: HTMLImageElement
        img.onload = loader.callback()
        img.src = data.image

        // el: HTMLLIElement
        el.className = 'page'
        el.appendChild(img)
    }
    clear() {
        ++this.sceneHash

        this.offsetList.forEach(v => {
            if (v.el.parentNode) v.el.parentNode.removeChild(v.el)
        })
        this.offsetList = []
    }
    scroll = () => {
        const scrollTop = (document.documentElement.scrollTop || document.body.scrollTop)
        const border = scrollTop + window.innerHeight * 0.8

        for (let i = this.offsetList.length; i--;) {
            const val = this.offsetList[i]
            const offset = val.offset;

            if (offset < border) {
                if (this.active !== i) {
                    this.active = i
                    val.play()
                }

                return;
            }
        }
    }
    delayResize = () => {
        clearTimeout(this.resizeTimer!)

        this.resizeTimer = setTimeout(() => {
            this.offsetList.forEach(data => data.offset = data.img.offsetTop)

            this.scroll()
        }, 200)
    }
}

const Loader = (callback?: (...args: any[]) => any) => {
    let loaded = 0
    const fn = () => {
        if (!--loaded && callback) callback()
    }

    return {
        callback() {
            ++loaded
            return fn
        }
    }
}
