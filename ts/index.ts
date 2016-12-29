/// <reference path="BGMPlayer.ts" />
/// <reference path="Page.ts" />
/// <reference path="pageData.d.ts" />

const topPage = document.getElementById('top') !
const comic = document.getElementById('comic') !
const loading = document.getElementById('loading') !
const next = document.getElementById('next') !

/** Model */
type State = 'top' | 'comic-loading' | 'comic-loaded'
let pageIndex: number
let pageState: State

const bgm = new BGMPlayer()
const page = new Page(document.getElementById('pages') !, bgm)

bgm.start()

topPage.addEventListener('click', nextButton)
next.addEventListener('click', nextButton)
window.addEventListener('hashchange', router)

router()

function router() {
    update(+location.hash.slice(1) || 0)
}

function nextButton() {
    scrollTo(0, 0)
    location.hash = pageDataList[pageIndex] ? `#${pageIndex + 1}` : '#'
}

function update(index: number) {
    pageIndex = index

    page.clear()
    bgm.stop()

    if (pageIndex === 0) {
        render('top')
        preloadBGM()
    }
    else {
        render('comic-loading')

        page.createScene(pageDataList[pageIndex - 1], () => {
            render('comic-loaded')
            preloadBGM()
        })
    }
}

function render(state: State) {
    switch (pageState = state) {
        case 'top': {
            topPage.style.display = null
            comic.style.display = 'none'

            break
        }
        case 'comic-loading': {
            topPage.style.display = 'none'
            comic.style.display = null
            loading.style.display = null
            next.style.display = 'none'

            break
        }
        case 'comic-loaded': {
            topPage.style.display = 'none'
            comic.style.display = null
            loading.style.display = 'none'
            next.style.display = null

            break
        }
    }
}

function preloadBGM() {
    const nextPage = pageDataList[pageIndex]

    if (!nextPage) return

    const loop = (list: PageData[]) => {
        if (pageState === 'comic-loading') return

        const page = list.shift()

        if (page === undefined) return

        bgm.load(page.sound, () => {
            loop(list)
        })
    }

    loop(nextPage.slice())
}
