/// <reference path="BGMPlayer.ts" />
/// <reference path="Page.ts" />

interface PageData {
    image: string
    sound: string
}

declare const pageDataList: PageData[][]

const topPage = document.getElementById('top') !
const comic = document.getElementById('comic') !
const next = document.getElementById('next') !

let nextButton = () => { }
let prevPage: Page | null = null

topPage.addEventListener('click', () => { nextButton() })
next.addEventListener('click', () => { nextButton() })

const player = new BGMPlayer();
const page = new Page(document.getElementById('pages') !, player);


player.start()
pageControler(+location.hash.slice(1) || 0)

window.addEventListener('hashchange', () => {
    pageControler(+location.hash.slice(1) || 0)
})

function pageControler(index: number) {
    next.textContent = 'loading...'
    nextButton = () => { }
    page.clear()
    player.end()

    // player.start()

    if (index === 0) {
        topPage.style.display = null
        comic.style.display = 'none'
        next.textContent = 'next'
        nextButton = () => {
            location.hash = '#1'
        }
    }
    else {
        topPage.style.display = 'none'
        comic.style.display = null
        const pageData = pageDataList[index - 1]

        page.createScene(pageData, () => {
            const nextData = pageDataList[index]

            if (nextData) {
                next.textContent = 'next'
                nextButton = () => {
                    // player.start(true)
                    location.hash = '#' + (index + 1)
                }
            }
            else {
                // 最後のページまで行った時の処理
                next.textContent = 'top'
                nextButton = () => { location.hash = '#' }
            }
        })
    }
}
