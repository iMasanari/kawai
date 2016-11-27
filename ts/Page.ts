class Page {
    pageList: { el: HTMLElement, image: HTMLImageElement, visit: Function, y?: number }[] = []
    active = 0
    private resizeTimer: number

    constructor(pageList: { url: string, visit: Function }[], callback?: Function) {
        let loadingCounter = 0
        const loaded = () => {
            if (!--loadingCounter && callback) {
                callback()
            }
        }

        for (const page of pageList) {
            ++loadingCounter
            this.load(page, loaded)
        }
    }
    load(url: { url: string, visit: Function }, callback: Function) {
        const image = new Image()
        const el = document.createElement('div')
        const data = { el, image, visit: url.visit }

        el.className = 'page'
        this.pageList.push(data)

        image.onload = () => {
            data.el.appendChild(image)
            callback(callback)
        }

        image.src = url.url
    }
    appendTo(el: HTMLElement) {
        this.pageList.forEach(page => {
            el.appendChild(page.el)
        })

        this.resize()

        window.addEventListener('scroll', this.scroll, false)
        window.addEventListener('resize', this.delayResize, false)
    }
    remove() {
        window.removeEventListener('scroll', this.scroll, false)
        window.addEventListener('resize', this.delayResize, false)

        this.pageList.forEach(({el}) => {
            if (el.parentNode) el.parentNode.removeChild(el)
        })
    }
    scroll = () => {
        const scrollTop = (document.documentElement.scrollTop || document.body.scrollTop)
        const border = scrollTop + window.innerHeight * 0.8

        for (let i = this.pageList.length; i--;) {
            const val = this.pageList[i].y;

            if (val < border) {
                if (this.active !== val) {
                    this.active = val
                    const page = this.pageList[i]
                    page.visit()
                }

                return;
            }
        }
    }
    resize = () => {
        console.log('resize');

        this.pageList.forEach(page => {
            page.y = page.image.offsetTop
        })
    }
    delayResize = () => {
        clearTimeout(this.resizeTimer)
        this.resizeTimer = setTimeout(this.resize, 200)
    }
}
