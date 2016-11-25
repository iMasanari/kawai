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

let pageIndex = 0
let nextPage = () => { }

topPage.addEventListener('click', () => { nextPage() })
next.addEventListener('click', () => { nextPage() })

const player = new BGMPlayer();

pageControler(pageIndex)

function pageControler(index: number, prev?: { player: BGMPlayer, page: Page }) {
    const pageData = pageDataList[index]
    let loadedContent = 2;

    player.loadAll(pageData.map(v => v.sound), loader)
    let page = new Page(pageData.map(v => ({ url: v.image, visit: () => { player.play(v.sound) } })), loader)

    nextPage = () => { }

    function loader() {
        if (!--loadedContent) {
            nextPage = () => {
                scrollTo(0, 0)

                if (prev && prev.player) prev.player.end()
                if (prev && prev.page) prev.page.remove()

                topPage.style.display = 'none'
                comic.style.display = null

                page.appendTo(pages)
                player.start()
                player.play(pageData[0].sound)

                if (pageDataList[index + 1]) {
                    next.textContent = 'next'
                    pageControler(index + 1, { player, page })
                } else {
                    next.textContent = 'top'

                    nextPage = () => {
                        topPage.style.display = null
                        comic.style.display = 'none'

                        player.end()
                        page.remove()

                        pageControler(0)
                    }
                }
            }
        }
    }
}