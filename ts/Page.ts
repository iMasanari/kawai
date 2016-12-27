namespace Page {
    export interface Data {
        offset: number
        el: HTMLElement
        img: HTMLImageElement
        play: () => void
    }
}

class Page {
    active = 0
    resizeTimer: number | undefined
    offsetList: Page.Data[] = []

    constructor(public el: HTMLElement, public bgmPlayer: BGMPlayer) {
        window.addEventListener('scroll', this.scroll, false)
        window.addEventListener('resize', this.delayResize, false)
    }
    createScene(data: PageData[], callback: () => any) {
        recursive(data.map((val, i) => (next: (res: Page.Data) => void) => {
            this.createPage(val, data => {
                if (i === 1) data.play()

                this.el.appendChild(data.el)
                data.offset = data.img.offsetTop
                this.offsetList.push(data)

                next(data)
            })
        }), callback)
    }

    createPage(data: PageData, callback?: (res: Page.Data) => any) {
        const loader = Loader(() => {
            if (callback) {
                callback({ el, img, play: () => { this.bgmPlayer.play(data.sound) }, offset: 0 })
            }
        })

        this.bgmPlayer.load(data.sound, loader())

        const img = new Image()

        img.onload = loader()
        img.src = data.image

        const el = document.createElement('div')
        el.className = 'page'
        el.appendChild(img)
    }
    imageLoad(url: string, callback?: (this: HTMLImageElement, ev: Event) => any) {
        const image = new Image()

        if (callback) image.onload = callback
        image.src = url

        return image
    }
    clear() {
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
                if (this.active !== offset) {
                    this.active = offset
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

const Loader = (callback?: (...arg: any[]) => any) => {
    let loaded = 0
    const fn = () => {
        if (!--loaded && callback) callback()
    }

    return () => {
        ++loaded
        return fn
    }
}
const recursive = <T>(array: ((res: (value: T) => void) => any)[], callback: (res: T[]) => any) => {
    let i = 0
    const len = array.length
    const res = new Array<T>(len)
    const next = (value: T) => {
        res.push(value)
        loop()
    }
    const loop = () => {
        if (i < len) array[i](next)
        else callback(res)
        ++i
    }
    loop()
}
