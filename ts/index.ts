/// <reference path="BGMPlayer.ts" />
/// <reference path="Page.ts" />
/// <reference path="pageData.d.ts" />

const topPage = document.getElementById('top') !
const comic = document.getElementById('comic') !
const loading = document.getElementById('loading') !
const next = document.getElementById('next') !

type Model = number
/** Model */
let pageIndex: Model

const bgm = new BGMPlayer()
const page = new Page(document.getElementById('pages') !, bgm)

bgm.start()

topPage.addEventListener('click', nextButton)
next.addEventListener('click', nextButton)
window.addEventListener('hashchange', router)

router()

function router() {
    pageIndex = +location.hash.slice(1) || 0
    update()
}

function nextButton() {
    scrollTo(0, 0)
    location.hash = pageDataList[pageIndex] ? `#${pageIndex + 1}` : '#'
}

function update() {
    page.clear()
    bgm.stop()

    if (pageIndex === 0) {
        render('top')
    }
    else {
        render('comic-loading')

        const pageData = pageDataList[pageIndex - 1]

        page.createScene(pageData, () => {
            render('comic-loaded')
        })
    }
}

type State = 'top' | 'comic-loading' | 'comic-loaded'

function render(state: State) {
    switch (state) {
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