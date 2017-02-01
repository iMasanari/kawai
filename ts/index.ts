/// <reference path="BGMPlayer.ts" />
/// <reference path="Page.ts" />
/// <reference path="pageData.d.ts" />

const topPage = document.getElementById('top') !
const comic = document.getElementById('comic') !
const loading = document.getElementById('loading') !
const next = document.getElementById('next') !

const nextText = document.getElementById('next-text') !
const nextTextLastpage = document.getElementById('next-text-lastpage') !

/** Model */
const enum State {
    top,
    comicLoading,
    comicLoaded
}

let pageIndex: number
let pageState: State

const bgm = new BGMPlayer()
const page = new Page(document.getElementById('pages') !, bgm)

topPage.addEventListener('click', nextButton)
next.addEventListener('click', nextButton)
window.addEventListener('popstate', router)

bgm.start()
router()

function router() {
    update(+location.hash.slice(2) || 0)
}

function nextButton() {
    scrollTo(0, 0)
    
    update(isLastpage() ? 0 : pageIndex + 1)
    history.pushState(null, '', pageIndex ? `#/${pageIndex}` : location.pathname);
}

function update(index: number) {
    pageIndex = index

    page.clear()
    bgm.stop()

    if (pageIndex === 0) {
        render(State.top)
        preloadBGM()
    }
    else {
        render(State.comicLoading)

        page.createScene(pageDataList[pageIndex - 1], () => {
            render(State.comicLoaded)
            preloadBGM()
        })
    }
}

function render(state: State) {
    function showElement(ele: HTMLElement) {
        ele.style.display = null
    }
    function hiddenElement(ele: HTMLElement) {
        ele.style.display = 'none'
    }
    switch (pageState = state) {
        case State.top: {
            showElement(topPage)
            hiddenElement(comic)

            break
        }
        case State.comicLoading: {
            hiddenElement(topPage)
            showElement(comic)
            showElement(loading)
            hiddenElement(next)

            break
        }
        case State.comicLoaded: {
            hiddenElement(loading)
            showElement(next)

            if (isLastpage()) {
                showElement(nextTextLastpage)
                hiddenElement(nextText)
            }
            else {
                hiddenElement(nextTextLastpage)
                showElement(nextText)
            }

            break
        }
    }
}

function preloadBGM() {
    const nextPage = pageDataList[pageIndex]

    if (!nextPage) return

    const loop = (list: PageData[]) => {
        if (pageState === State.comicLoading) return

        const page = list.shift()

        if (page === undefined) return

        bgm.load(page.sound, () => {
            loop(list)
        })
    }

    loop(nextPage.slice())
}

function isLastpage() {
    return !pageDataList[pageIndex]
}
