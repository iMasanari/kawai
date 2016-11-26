/// <reference path="BGMPlayer.ts" />
/// <reference path="Page.ts" />

interface PageData {
    image: string
    sound: string
}
const pageDataList: PageData[][] = [[
    { image: "pic/01.png", sound: "sound/01.mp3" },
    { image: "pic/02.png", sound: "sound/02.mp3" },
    { image: "pic/03.gif", sound: "sound/03.mp3" },
    { image: "pic/04.png", sound: "sound/04.mp3" },
    { image: "pic/05.png", sound: "sound/00.mp3" },
    { image: "pic/06.png", sound: "sound/00.mp3" },
    { image: "pic/07.png", sound: "sound/05.mp3" },
    { image: "pic/08.png", sound: "sound/05.mp3" },
    { image: "pic/09.png", sound: "sound/06.mp3" },
    { image: "pic/10.png", sound: "sound/07.mp3" },
    { image: "pic/11.png", sound: "sound/08.mp3" },
    { image: "pic/12.png", sound: "sound/09.mp3" },
    { image: "pic/13.png", sound: "sound/09.mp3" }
], [
    { image: "pic/14.png", sound: "./sound/00.mp3" },
    { image: "pic/15.png", sound: "./sound/10.mp3" },
    { image: "pic/16.png", sound: "./sound/11.mp3" },
    { image: "pic/17.png", sound: "./sound/12.mp3" },
    { image: "pic/18.png", sound: "./sound/13.mp3" },
    { image: "pic/19.png", sound: "./sound/14.mp3" },
    { image: "pic/20.png", sound: "./sound/15.mp3" },
    { image: "pic/21.png", sound: "./sound/15.mp3" },
    { image: "pic/22.png", sound: "./sound/15.mp3" },
    { image: "pic/23.png", sound: "./sound/16.mp3" },
    { image: "pic/24.png", sound: "./sound/17.mp3" },
    { image: "pic/25.png", sound: "./sound/18.mp3" },
    { image: "pic/26.png", sound: "./sound/19.mp3" },
]]

const topPage = document.getElementById('top')
const comic = document.getElementById('comic')
const pages = document.getElementById('pages')
const next = document.getElementById('next')

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

        nextLoad()
    } else {
        topPage.style.display = 'none'
        comic.style.display = null

        console.log(pageLog);

        if (pageLog[index]) {
            pageLog[index].appendTo(pages)
            player.play(pageDataList[index][0].sound)

            nextLoad()
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

                    nextLoad()
                })
            })
        }
    }

    function nextLoad() {
        const nextPage = pageDataList[index + 1]

        if (nextPage) {
            if (pageLog[index + 1]) {
                callback()
            } else {
                next.textContent = 'loading...'
                nextButton = () => { }

                player.loadAll(nextPage.map(v => v.sound), () => {
                    let page = new Page(nextPage.map(v => ({ url: v.image, visit: () => { player.play(v.sound) } })), () => {
                        pageLog[index + 1] = page
                        callback()
                    })
                })

            }
            function callback() {
                next.textContent = 'next'
                nextButton = () => {
                    if (pageLog[index]) pageLog[index].remove()
                    player.start()
                    location.href = '#' + (index + 2)
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
}