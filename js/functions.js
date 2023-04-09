function renderDiagram(object, period) {
    const svgh = 'http://www.w3.org/2000/svg'

    const {name, events} = object

    let years = []
    for(i = period.from; i <= period.before; i++) years.push(i)

    let objectYear = [
        ...events.map(event => new Date(event.contract).getFullYear()),
        ...events.map(event => new Date(event.actual).getFullYear())
    ]

    const offsetX = 40
    const headerHeight = 20
    const xLimit = document.querySelector('body').offsetWidth-150, yLimit = 180

    const nameBoxWidth = 100

    const from = Math.floor(new Date(period.from, 0, 1) / 86400000)
    const before = Math.floor(new Date(period.before, 11, 31) / 86400000)

    // Коэффициент пересчета "пиксели/время"
    const k = (xLimit - nameBoxWidth - offsetX) / (before - from)


    const holst = document.createElementNS(svgh, 'svg')
    holst.setAttribute('class', 'holst')
    holst.setAttribute('width', xLimit)
    holst.setAttribute('height', yLimit)


    const boxWidth = (before - from) / years.length * k

    // Создаем название объекта
    createTextBox(0, 0, nameBoxWidth, yLimit, name, 'label')

    // Создаем шкалу
    years.forEach((year, i) => {
        const x = nameBoxWidth + 365 * i * k
        const filled = objectYear.includes(year)
        createTextBox(x, 0, boxWidth, headerHeight, year, '', filled)
        createTextBox(x, headerHeight, boxWidth, (yLimit-headerHeight)/2, '', '', filled)
        createTextBox(x, headerHeight+(yLimit-headerHeight)/2, boxWidth, (yLimit-headerHeight)/2, '', '', filled)
    })




    function createTextBox(x, y, width, height, text='', cls='', filled=false){

        const box = document.createElementNS(svgh, 'rect')
        box.setAttribute('x', x)
        box.setAttribute('y', y )
        box.setAttribute('width', width )
        box.setAttribute('height', height )
        box.setAttribute('stroke', 'gray')
        !filled
            ? box.setAttribute('fill', 'white')
            : box.setAttribute('fill', 'lightblue')
        holst.appendChild(box)

        if (name) {
            const inscription = document.createElementNS(svgh, 'text')
            inscription.setAttribute('x', x + width / 2)
            inscription.setAttribute('y', y + 10)
            inscription.setAttribute('dominant-baseline', 'middle')
            inscription.setAttribute('text-anchor', 'middle')
            inscription.setAttribute('class', cls)
            inscription.textContent = text
            holst.appendChild(inscription)
        }
    }


    // Создаем диаграмму
    events.forEach((el, i) => {
        const y1 = (yLimit / 4 + headerHeight / 2)
        const y2 = y1 + yLimit / 2
        const contractPosition = getContractPosition(el)
        const actualPosition = getActualPosition(el)

        createLine(contractPosition, y1, actualPosition, y2, '3 2')
        const lastElem = events.length - 1
        if (i === 0) {
            createLine(getContractPosition(events[0]), y1, getContractPosition(events[lastElem]), y1)
            createLine(getActualPosition(events[0]), y2, getActualPosition(events[lastElem]), y2)
        }

        createNode(contractPosition, y1, el.contract, el, 'byContract')
        createNode(actualPosition, y2, el.actual, el, el.status)
    })


    // Рисуем объект
    const row = document.createElement('div')
    row.className = 'row'
    diagram.appendChild(row)
    row.appendChild(holst)


    function getContractPosition(el) {
        return parseInt((new Date(el.contract).getTime() / 86400000 - from) * k) + nameBoxWidth
    }

    function getActualPosition(el) {
        return parseInt((new Date(el.actual).getTime() / 86400000  - from) * k) + nameBoxWidth
    }


    function createNode(x, y, data, el, type) {
        const width = 10, height = 10
        const rect = document.createElementNS(svgh, "rect")
        rect.setAttribute("x", x - width/2)
        rect.setAttribute("y", y - height/2)
        rect.setAttribute("width", width)
        rect.setAttribute("height", height)
        rect.setAttribute('stroke', 'black')
        rect.setAttribute('class', 'rect')
        rect.setAttribute('type', type)
        holst.appendChild(rect)

        const sts = document.createElementNS(svgh, "text")
        sts.setAttribute("x", x)
        sts.setAttribute("y", y)
        sts.setAttribute('dominant-baseline', 'middle')
        sts.setAttribute('text-anchor', 'middle')
        sts.textContent = el.status === 'ok' || el.status === 'disruption' ? '✓' : ''
        holst.appendChild(sts)

        const legenda = document.createElementNS(svgh, "text")
        legenda.setAttribute("x", x)
        legenda.setAttribute("y", y - 15)
        legenda.setAttribute('text-anchor', 'middle')
        legenda.textContent = el.legenda
        holst.appendChild(legenda)

        const dta = document.createElementNS(svgh, "text")
        dta.setAttribute("x", x)
        dta.setAttribute("y", y + 20)
        dta.setAttribute('text-anchor', 'middle')
        dta.textContent = data.split('-').reverse().join('.')
        holst.appendChild(dta)

    }


    function createLine(x1, y1, x2, y2, type='1 0', color='black') {
        const line = document.createElementNS(svgh, 'line')
        line.setAttribute('x1', x1)
        line.setAttribute('x2', x2)
        line.setAttribute('y1', y1)
        line.setAttribute('y2', y2)
        line.setAttribute('class', 'line')
        line.setAttribute('stroke', color)
        line.setAttribute('stroke-dasharray', type)
        holst.appendChild(line)
    }

}
