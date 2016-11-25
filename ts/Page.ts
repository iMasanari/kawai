class Page {
    pageList: { el: HTMLElement, visit: Function, y?: number }[] = []

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
        const data = { el, visit: url.visit }

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

        this.pageList.forEach(page => {
            page.y = page.el.offsetTop
        })

        window.addEventListener('scroll', this.scroll, false)
    }
    remove() {
        window.removeEventListener('scroll', this.scroll, false)

        this.pageList.forEach(({el}) => {
            el.parentNode.removeChild(el)
        })
    }
    scroll = (() => {
            let active = 0

            return () => {
                const scrollY = (document.documentElement.scrollTop || document.body.scrollTop) + window.innerHeight;

                for (let i = this.pageList.length; i--;) {
                    const val = this.pageList[i].y;

                    if (val <= scrollY) {
                        if (active !== val) {
                            active = val
                            const page = this.pageList[i]
                            page.visit()
                        }

                        return;
                    }
                }
            }
        })()
}