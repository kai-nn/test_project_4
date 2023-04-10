const select = document.querySelector('.select')
const period = document.getElementById('period')


// Рендеринг листа выбора объектов
objects.forEach(el => {
    let li = document.createElement('li')
    li.innerHTML = `<input class="checkbox" type="checkbox" name="${el.name}">${el.name}</input>`
    select.appendChild(li)
})


// рендеринг первого объекта после загрузки
if(objects.length !== 0){
    const defaultRenderObject = 0
    const selectedCheckBox = select.querySelectorAll('input.checkbox')[defaultRenderObject]
    selectedCheckBox.setAttribute('checked', 'checked')

    // // Следующий код для отладкаи: включаем все объекты
    // objects.forEach((el, i) => {
    //     const selectedCheckBox = select.querySelectorAll('input.checkbox')[i]
    //     selectedCheckBox.setAttribute('checked', 'checked')
    // })

    updateDiagram()
}


// Рескейл диаграммы при изменении размера окна
window.onresize = () => updateDiagram()


period.addEventListener('change', ev => updateDiagram())


select.addEventListener('click', function (ev){
    if(ev.target.type !== 'checkbox') return
    updateDiagram()
})


// Вывод в .pdf через библиотеку html2pdf. Внимание! При конвертации html -> pdf
// наступает деградация svg из-за неправильного использования css
document.getElementById('download').onclick = () => {
    const element = document.querySelector('.diagram')
    const opt = {
        margin: 0,
        filename: 'Отчет.pdf',
    }
    html2pdf()
        .set(opt)
        .from(element)
        .save()
}


// Рендеринг диаграммы
function updateDiagram(){
    const inputs = select.querySelectorAll('input.checkbox:checked')
    let selectedCheckBox = []
    inputs.forEach(input => selectedCheckBox.push(input.name))

    const period = getPeriod()

    const fetchingByName = objects.filter(object => selectedCheckBox.includes(object.name))
    const fetchingByPeriod = fetchingByName.map(object => {
        const inspectedObject = {
            name: object.name,
            events: object.events.filter(event => {
                const year = new Date(event.contract).getFullYear()
                return period.from <= year && year <= period.before
            })
        }
        return inspectedObject
    })

    const diagram = document.getElementById('diagram')
    diagram.innerHTML = ''
    fetchingByPeriod.forEach(object => renderDiagram(object, period))
}


function getPeriod() {
    return  {
        from: new Date(document.getElementById('dataFrom').value).getFullYear(),
        before: new Date(document.getElementById('dataBefore').value).getFullYear()
    }
}

