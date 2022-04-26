const cards = document.getElementById('cards')
const items = document.getElementById('items')
const footer = document.getElementById('footer')
const templateCard = document.getElementById('template-card').content //.content acceder a los elementos
const templateFooter = document.getElementById('template-footer').content
const templateCarrito = document.getElementById('template-carrito').content
const fragment = document.createDocumentFragment() //fragment (memoria volatil)
let carrito = {} //mi coleccion de obejto

// Eventos
// El evento DOMContentLoaded es disparado cuando el documento HTML ha sido completamente cargado y parseado
document.addEventListener('DOMContentLoaded', e => {
    fetchData() 
    if (localStorage.getItem('carrito')) {
        carrito = JSON.parse(localStorage.getItem('carrito'))
        pintarCarrito()
    }});
cards.addEventListener('click', e => { //elemento capturado a modificar
    addCarrito(e) });
items.addEventListener('click', e => { 
    btnAumentarDisminuir(e) })

// Traer productos
const fetchData = async () => {
    const res = await fetch('inf.json');
    const data = await res.json()
    // console.log(data)
    pintarCards(data)
}

// Pintar productos
const pintarCards = data => { //logica
    data.forEach(item => {
        templateCard.querySelector('h5').textContent = item.title
        templateCard.querySelector('p').textContent = item.precio
        templateCard.querySelector('button').dataset.id = item.id
        templateCard.querySelector('img').src = item.img
        const clone = templateCard.cloneNode(true)
        fragment.appendChild(clone)
    })
    cards.appendChild(fragment) // memoria volatil (evitando que altere su composición)
}

// Agregar al carrito
const addCarrito = e => {
    if (e.target.classList.contains('btn-success')) {
        Toastify({
            text: "Gracias por su compra",
            duration: 3000
        }).showToast();
        // console.log(e.target.dataset.id)
        // console.log(e.target.parentElement)
        setCarrito(e.target.parentElement)//al dar click en boton empujo los elementos a mi setcarrito
    }
    e.stopPropagation() //Detener cualquier otro evento que se pueda llegar a generar (eredan los eventos del cont. padre)
}

const setCarrito = item => { //captura los elementos del addcarrito
    // console.log(item)
    const producto = {
        title: item.querySelector('h5').textContent,
        precio: item.querySelector('p').textContent,
        id: item.querySelector('button').dataset.id,
        cantidad: 1
    }
    // console.log(producto)
    if (carrito.hasOwnProperty(producto.id)) {
        producto.cantidad = carrito[producto.id].cantidad + 1
    }

    carrito[producto.id] = { ...producto } // adquiriendo inf y haciendo una copia 
    
    pintarCarrito()
}

const pintarCarrito = () => {
    items.innerHTML = ''//limpio el html para que no se sobre escriba

    Object.values(carrito).forEach(producto => {
        templateCarrito.querySelector('th').textContent = producto.id
        templateCarrito.querySelectorAll('td')[0].textContent = producto.title
        templateCarrito.querySelectorAll('td')[1].textContent = producto.cantidad
        templateCarrito.querySelector('span').textContent = producto.precio * producto.cantidad
        
        //botones
        templateCarrito.querySelector('.btn-info').dataset.id = producto.id
        templateCarrito.querySelector('.btn-danger').dataset.id = producto.id

        const clone = templateCarrito.cloneNode(true)
        fragment.appendChild(clone)
    })
    items.appendChild(fragment)//pintar la inf

    pintarFooter()
    localStorage.setItem('carrito', JSON.stringify(carrito)) //la coleccion de objetos pasa a un string y del local lo recupero como objeto
}

const pintarFooter = () => {
    footer.innerHTML = ''
    
    if (Object.keys(carrito).length === 0) { //carrito vacío no pinta nada
        footer.innerHTML = `
        <th scope="row" colspan="5">Carrito vacío con innerHTML</th> 
        `
        return //detectamos el carrito vacio y no sigue 
    }
    
    // sumar cantidad y sumar totales
    const nCantidad = Object.values(carrito).reduce((acc, { cantidad }) => acc + cantidad, 0)
    const nPrecio = Object.values(carrito).reduce((acc, {cantidad, precio}) => acc + cantidad * precio ,0)
    // console.log(nPrecio)

    templateFooter.querySelectorAll('td')[0].textContent = nCantidad
    templateFooter.querySelector('span').textContent = nPrecio

    const clone = templateFooter.cloneNode(true)
    fragment.appendChild(clone)

    footer.appendChild(fragment)

    const boton = document.querySelector('#vaciar-carrito')
    boton.addEventListener('click', () => {
        Swal.fire({
            title: `Usted esta vaciando el carrito de compras`, 
            text: 'Seguro que quiere continuar',
            icon: 'warning',
            confirmButtonText: 'SI'
        })
        carrito = {}
        pintarCarrito()
    })

}
const btnAumentarDisminuir = e => {
    // console.log(e.target.classList.contains('btn-info'))
    if (e.target.classList.contains('btn-info')) {
        const producto = carrito[e.target.dataset.id]
        producto.cantidad++
        carrito[e.target.dataset.id] = { ...producto }
        pintarCarrito()
    }

    if (e.target.classList.contains('btn-danger')) {
        const producto = carrito[e.target.dataset.id]
        producto.cantidad--
        if (producto.cantidad === 0) {
            delete carrito[e.target.dataset.id]
        } else {
            carrito[e.target.dataset.id] = {...producto}
            Swal.fire({
                title: `Usted esta quitando este producto del carrito`, 
                text: 'Seguro que quiere continuar',
                icon: 'warning',
                confirmButtonText: 'SI'
            })
        }
        pintarCarrito()
    }
    e.stopPropagation()
}