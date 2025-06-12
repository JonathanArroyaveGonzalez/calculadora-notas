class CalculadoraNotas {
    constructor() {
        this.notas = [];
        this.notaMinima = 3.0;
        this.contadorId = 0;
        this.initEventListeners();
        this.agregarFilaVacia();
    }

    initEventListeners() {
        const btnAgregar = document.getElementById('agregar-nota');
        const btnCalcular = document.getElementById('calcular-nota');

        btnAgregar.addEventListener('click', () => this.agregarFilaVacia());
        btnCalcular.addEventListener('click', () => this.calcularNotas());
    }

    agregarFilaVacia() {
        const container = document.getElementById('notas-container');
        const id = this.contadorId++;
        
        // Limpiar estado vacío si existe
        const emptyState = container.querySelector('.empty-state');
        if (emptyState) {
            emptyState.remove();
        }

        const filaHTML = `
            <div class="nota-row" data-id="${id}">
                <div class="input-group">
                    <label>Nota:</label>
                    <input type="number" class="nota-input" min="0" max="5" step="0.1" placeholder="0.0">
                    <span class="error-message" style="display: none;"></span>
                </div>
                <div class="input-group">
                    <label>Porcentaje %:</label>
                    <input type="number" class="porcentaje-input" min="1" max="100" step="1" placeholder="0">
                    <span class="error-message" style="display: none;"></span>
                </div>
                <button class="btn-remove" onclick="calculadora.eliminarFila(${id})">❌</button>
            </div>
        `;

        container.insertAdjacentHTML('beforeend', filaHTML);
    }

    eliminarFila(id) {
        const fila = document.querySelector(`[data-id="${id}"]`);
        if (fila) {
            fila.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                fila.remove();
                this.verificarEstadoVacio();
                this.limpiarErrores();
            }, 300);
        }
    }

    verificarEstadoVacio() {
        const container = document.getElementById('notas-container');
        const filas = container.querySelectorAll('.nota-row');
        
        if (filas.length === 0) {
            container.innerHTML = '<div class="empty-state">No hay notas ingresadas. Haz clic en "Agregar nota" para comenzar.</div>';
        }
    }

    recolectarDatos() {
        const filas = document.querySelectorAll('.nota-row');
        const datos = [];
        let hayErrores = false;

        this.limpiarErrores();

        filas.forEach(fila => {
            const notaInput = fila.querySelector('.nota-input');
            const porcentajeInput = fila.querySelector('.porcentaje-input');
            
            const nota = parseFloat(notaInput.value);
            const porcentaje = parseInt(porcentajeInput.value);

            // Solo validar si hay algún valor ingresado
            if (notaInput.value.trim() !== '' || porcentajeInput.value.trim() !== '') {
                // Validar nota
                if (isNaN(nota) || nota < 0 || nota > 5) {
                    this.mostrarError(notaInput, 'Nota debe estar entre 0.0 y 5.0');
                    hayErrores = true;
                }

                // Validar porcentaje
                if (isNaN(porcentaje) || porcentaje < 1 || porcentaje > 100) {
                    this.mostrarError(porcentajeInput, 'Porcentaje debe estar entre 1 y 100');
                    hayErrores = true;
                }

                // Si ambos valores son válidos, agregar a los datos
                if (!isNaN(nota) && !isNaN(porcentaje) && 
                    nota >= 0 && nota <= 5 && 
                    porcentaje >= 1 && porcentaje <= 100) {
                    datos.push({ nota, porcentaje });
                }
            }
        });

        // Validar que el porcentaje total no exceda 100%
        const porcentajeTotal = datos.reduce((sum, item) => sum + item.porcentaje, 0);
        if (porcentajeTotal > 100) {
            filas.forEach(fila => {
                const porcentajeInput = fila.querySelector('.porcentaje-input');
                if (porcentajeInput.value.trim() !== '') {
                    this.mostrarError(porcentajeInput, `Total: ${porcentajeTotal}% (máximo 100%)`);
                }
            });
            hayErrores = true;
        }

        return { datos, hayErrores, porcentajeTotal };
    }

    mostrarError(input, mensaje) {
        input.classList.add('error');
        const errorSpan = input.parentElement.querySelector('.error-message');
        errorSpan.textContent = mensaje;
        errorSpan.style.display = 'block';
    }

    limpiarErrores() {
        document.querySelectorAll('.error').forEach(el => el.classList.remove('error'));
        document.querySelectorAll('.error-message').forEach(el => {
            el.style.display = 'none';
            el.textContent = '';
        });
    }

    calcularNotas() {
        const { datos, hayErrores, porcentajeTotal } = this.recolectarDatos();

        if (hayErrores) {
            return;
        }

        if (datos.length === 0) {
            alert('Por favor, ingresa al menos una nota con su porcentaje.');
            return;
        }

        this.notas = datos;
        this.actualizarResultados();
    }

    calcularNotaDefinitiva() {
        if (this.notas.length === 0) return 0;
        
        return this.notas.reduce((suma, item) => {
            return suma + (item.nota * item.porcentaje / 100);
        }, 0);
    }

    calcularPorcentajeTotal() {
        return this.notas.reduce((total, item) => total + item.porcentaje, 0);
    }

    actualizarResultados() {
        const porcentajeCompletado = this.calcularPorcentajeTotal();
        const notaDefinitiva = this.calcularNotaDefinitiva();
        
        // Actualizar elementos del DOM
        document.getElementById('porcentaje-completado').textContent = `${porcentajeCompletado}%`;
        document.getElementById('nota-definitiva').textContent = notaDefinitiva.toFixed(2);
        
        this.actualizarEstado(porcentajeCompletado, notaDefinitiva);
        this.actualizarProyeccion(porcentajeCompletado, notaDefinitiva);
    }

    actualizarEstado(porcentajeCompletado, notaDefinitiva) {
        const estadoElement = document.getElementById('estado');
        
        if (porcentajeCompletado === 100) {
            if (notaDefinitiva >= this.notaMinima) {
                estadoElement.textContent = 'APROBADO ✅';
                estadoElement.className = 'value aprobado nota-grande';
            } else {
                estadoElement.textContent = 'REPROBADO ❌';
                estadoElement.className = 'value reprobado nota-grande';
            }
        } else {
            estadoElement.textContent = 'INCOMPLETO ⏳';
            estadoElement.className = 'value incompleto';
        }
    }

    actualizarProyeccion(porcentajeCompletado, notaDefinitiva) {
        const mensajeElement = document.getElementById('mensaje-proyeccion');
        
        if (this.notas.length === 0) {
            mensajeElement.textContent = 'Agrega tus notas para ver la proyección';
            return;
        }

        if (porcentajeCompletado === 100) {
            mensajeElement.innerHTML = `
                <strong>🎉 Calificaciones completas!</strong><br><br>
                Tu nota definitiva es <strong>${notaDefinitiva.toFixed(2)}</strong><br>
                ${notaDefinitiva >= this.notaMinima ? 
                    '¡Felicitaciones, has aprobado la materia!' : 
                    'No alcanzaste la nota mínima para aprobar (3.0)'}
            `;
            return;
        }

        const porcentajeRestante = 100 - porcentajeCompletado;
        
        // Calcular qué nota necesita en el porcentaje restante para aprobar
        const notaNecesariaTotal = this.notaMinima;
        const puntosYaObtenidos = notaDefinitiva;
        const puntosNecesarios = notaNecesariaTotal - puntosYaObtenidos;
        const notaNecesariaRestante = (puntosNecesarios * 100) / porcentajeRestante;

        let mensaje = `
            <strong>📊 Análisis de tu progreso:</strong><br><br>
            📈 <strong>Porcentaje restante:</strong> ${porcentajeRestante}%<br>
            📋 <strong>Nota actual:</strong> ${notaDefinitiva.toFixed(2)}<br><br>
        `;

        if (notaNecesariaRestante <= 0) {
            mensaje += `
                <span style="color: #28a745; font-weight: bold;">
                    ✅ ¡Ya tienes asegurada la materia!<br>
                    Tu nota actual ya supera la mínima para aprobar.
                </span>
            `;
        } else if (notaNecesariaRestante <= 5.0) {
            if (notaNecesariaRestante <= 3.5) {
                mensaje += `
                    <span style="color: #28a745; font-weight: bold;">
                        🎯 Para aprobar necesitas: <strong>${notaNecesariaRestante.toFixed(2)}</strong><br>
                        ¡Estás en buen camino! Es una meta alcanzable.
                    </span>
                `;
            } else {
                mensaje += `
                    <span style="color: #ffc107; font-weight: bold;">
                        ⚠️ Para aprobar necesitas: <strong>${notaNecesariaRestante.toFixed(2)}</strong><br>
                        Debes esforzarte más en las próximas evaluaciones.
                    </span>
                `;
            }
        } else {
            mensaje += `
                <span style="color: #dc3545; font-weight: bold;">
                    ❌ Matemáticamente es imposible aprobar<br>
                    Necesitarías ${notaNecesariaRestante.toFixed(2)} (máximo posible: 5.0)
                </span>
            `;
        }

        mensajeElement.innerHTML = mensaje;
    }
}

// Agregar estilos para la animación de salida
const style = document.createElement('style');
style.textContent = `
    @keyframes slideOut {
        from {
            opacity: 1;
            transform: translateX(0);
        }
        to {
            opacity: 0;
            transform: translateX(-100%);
        }
    }
`;
document.head.appendChild(style);

// Inicializar la calculadora
const calculadora = new CalculadoraNotas();
