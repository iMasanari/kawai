/// <reference path="BGMPlayer.ts" />
/// <reference path="Page.ts" />

interface PageData {
    image: string
    sound: string
}

declare const pageDataList: PageData[][]

const topPage = document.getElementById('top')!
const comic = document.getElementById('comic')!
const pages = document.getElementById('pages')!
const next = document.getElementById('next')!

let nextButton = () => { }
let prevPage: Page | null = null

topPage.addEventListener('click', () => { nextButton() })
next.addEventListener('click', () => { nextButton() })

const player = new BGMPlayer();

interface logData {
    page: Page
    player: BGMPlayer
}

const pageLog: { [index: number]: Page } = {}

pageControler((+location.hash.slice(1) || 0) - 1)

window.addEventListener('hashchange', () => {
    pageControler((+location.hash.slice(1) || 0) - 1)
})

function pageControler(index: number) {
    for (const key in pageLog) if (pageLog.hasOwnProperty(key)) {
        pageLog[key].remove()
    }

    if (index < 0) {
        topPage.style.display = null
        comic.style.display = 'none'
        player.end()

        preload(index + 1)
    } else {
        topPage.style.display = 'none'
        comic.style.display = null

        console.log(pageLog);

        if (pageLog[index]) {
            pageLog[index].appendTo(pages)
            player.play(pageDataList[index][0].sound)

            preload(index + 1)
        } else {
            const pageData = pageDataList[index]

            player.loadAll(pageData.map(v => v.sound), () => {
                player.start()
                player.play(pageData[0].sound)

                const list = pageData.map(v => ({ url: v.image, visit: () => { player.play(v.sound) } }))
                const page = new Page(list, () => {
                    pageLog[index] = page
                    console.log(pageLog);

                    page.appendTo(pages)

                    preload(index + 1)
                })
            })
        }
    }
}

    function preload(index: number) {
        const nextPage = pageDataList[index]

        if (nextPage) {
            if (pageLog[index]) {
                callback()
            } else {
                next.textContent = 'loading...'
                nextButton = () => { }

                player.loadAll(nextPage.map(v => v.sound), () => {
                    let page = new Page(nextPage.map(v => ({ url: v.image, visit: () => { player.play(v.sound) } })), () => {
                        pageLog[index] = page
                        callback()
                    })
                })

            }
            function callback() {
                next.textContent = 'next'
                nextButton = () => {
                    if (pageLog[index - 1]) pageLog[index - 1].remove()
                    player.start()
                    location.href = '#' + (index + 1)
                    window.scrollTo(0, 0)
                }
            }
        } else {
            next.textContent = 'top'
            nextButton = () => {
                location.href = '#'
            }
        }
    }