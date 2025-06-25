class CalculadoraPromedio {
    constructor() {
        // Inicializar propiedades
        this.datosAcademicos = null;
        this.materiasAprobadas = [];
        this.materiasPendientes = [];
        this.materiasSeleccionadas = [];
        this.promedioPonderadoActual = 0;
        this.creditosAprobados = 0;
        this.creditosRestantes = 0;

        // Inicializar elementos del DOM
        this.inicializarElementosDOM();
        
        // Cargar datos desde el JSON
        this.cargarDatos()
            .then(() => {
                this.mostrarDatosActuales();
                this.mostrarMateriasAprobadas();
                this.mostrarMateriasPendientes();
                this.inicializarEventos();
            })
            .catch(error => {
                console.error('Error al cargar los datos:', error);
                alert('Ocurrió un error al cargar los datos académicos. Por favor, recarga la página.');
            });
    }

    inicializarElementosDOM() {
        // Elementos para mostrar datos actuales
        this.promedioActualElement = document.getElementById('promedio-actual');
        this.creditosAprobadosElement = document.getElementById('creditos-aprobados');
        this.creditosRestantesElement = document.getElementById('creditos-restantes');
        
        // Elementos para proyección
        this.promedioMetaInput = document.getElementById('promedio-meta');
        this.calcularProyeccionBtn = document.getElementById('calcular-proyeccion');
        this.mensajeProyeccionElement = document.getElementById('mensaje-proyeccion');
        
        // Elementos para materias
        this.materiasListElement = document.getElementById('materias-list');
        this.materiasSeleccionadasElement = document.getElementById('materias-seleccionadas');
        this.totalCreditosElement = document.getElementById('total-creditos');
        this.materiasAprobadasElement = document.getElementById('materias-aprobadas-body');
        
        // Elementos para filtros
        this.filtroMateriasInput = document.getElementById('filtro-materias');
        this.filtroAprobadasInput = document.getElementById('filtro-aprobadas');
    }

    inicializarEventos() {
        // Evento para calcular proyección
        this.calcularProyeccionBtn.addEventListener('click', () => this.calcularProyeccion());
        
        // Eventos para filtros
        this.filtroMateriasInput.addEventListener('input', () => this.filtrarMateriasPendientes());
        this.filtroAprobadasInput.addEventListener('input', () => this.filtrarMateriasAprobadas());

        // Evento para validar promedio meta
        this.promedioMetaInput.addEventListener('input', () => {
            const valor = parseFloat(this.promedioMetaInput.value);
            if (isNaN(valor) || valor < 3.0 || valor > 5.0) {
                this.mostrarError(this.promedioMetaInput, 'Promedio debe estar entre 3.0 y 5.0');
            } else {
                this.limpiarError(this.promedioMetaInput);
            }
        });
    }

    async cargarDatos() {
        try {
            const response = await fetch('download.json');
            if (!response.ok) {
                throw new Error('No se pudo cargar el archivo JSON');
            }
            this.datosAcademicos = await response.json();
            
            // Procesar datos
            this.materiasAprobadas = this.datosAcademicos.asignaturas_aprobadas_con_nota_mayor_a_3 || [];
            this.materiasPendientes = this.datosAcademicos.asignaturas_pendientes || [];
            this.promedioPonderadoActual = this.datosAcademicos.promedio_ponderado_actual || 0;
            
            // Calcular créditos
            this.creditosAprobados = this.materiasAprobadas.reduce((sum, materia) => sum + materia.creditos, 0);
            this.creditosRestantes = this.materiasPendientes.reduce((sum, materia) => sum + materia.creditos, 0);
            
        } catch (error) {
            console.error('Error al cargar y procesar el JSON:', error);
            throw error;
        }
    }

    mostrarDatosActuales() {
        // Mostrar promedio y créditos actuales
        this.promedioActualElement.textContent = this.promedioPonderadoActual.toFixed(2);
        this.creditosAprobadosElement.textContent = this.creditosAprobados.toFixed(1);
        this.creditosRestantesElement.textContent = this.creditosRestantes.toFixed(1);
        
        // Aplicar estilo según promedio
        if (this.promedioPonderadoActual >= 4.0) {
            this.promedioActualElement.classList.add('aprobado');
        } else if (this.promedioPonderadoActual >= 3.0) {
            this.promedioActualElement.classList.add('incompleto');
        } else {
            this.promedioActualElement.classList.add('reprobado');
        }
    }

    mostrarMateriasAprobadas() {
        // Limpiar contenedor
        this.materiasAprobadasElement.innerHTML = '';
        
        // Ordenar materias por nota descendente
        const materiasOrdenadas = [...this.materiasAprobadas].sort((a, b) => b.nota - a.nota);
        
        // Mostrar materias en tabla
        materiasOrdenadas.forEach(materia => {
            const fila = document.createElement('tr');
            fila.dataset.codigo = materia.codigo;
            fila.dataset.descripcion = materia.descripcion.toLowerCase();
            
            let notaClass = '';
            if (materia.nota >= 4.0) {
                notaClass = 'nota-sobresaliente';
            } else if (materia.nota >= 3.5) {
                notaClass = 'nota-normal';
            } else {
                notaClass = 'nota-baja';
            }
            
            fila.innerHTML = `
                <td>${materia.codigo}</td>
                <td>${materia.descripcion}</td>
                <td>${materia.creditos.toFixed(1)}</td>
                <td class="${notaClass}">${materia.nota.toFixed(1)}</td>
            `;
            
            this.materiasAprobadasElement.appendChild(fila);
        });
    }

    mostrarMateriasPendientes() {
        // Limpiar contenedor
        this.materiasListElement.innerHTML = '';
        
        if (this.materiasPendientes.length === 0) {
            this.materiasListElement.innerHTML = '<div class="empty-state">No hay materias pendientes</div>';
            return;
        }
        
        // Ordenar materias por créditos descendentes
        const materiasOrdenadas = [...this.materiasPendientes].sort((a, b) => b.creditos - a.creditos);
        
        // Mostrar materias en lista
        materiasOrdenadas.forEach(materia => {
            const materiaItem = document.createElement('div');
            materiaItem.className = 'materia-item';
            materiaItem.dataset.codigo = materia.codigo;
            materiaItem.dataset.descripcion = materia.descripcion.toLowerCase();
            materiaItem.dataset.creditos = materia.creditos;
            
            materiaItem.innerHTML = `
                <div class="materia-info">
                    <div class="materia-codigo">${materia.codigo}</div>
                    <div class="materia-nombre">${materia.descripcion}</div>
                </div>
                <div class="materia-creditos">${materia.creditos.toFixed(1)} CR</div>
            `;
            
            // Evento para seleccionar/deseleccionar materia
            materiaItem.addEventListener('click', () => this.toggleSeleccionarMateria(materia));
            
            this.materiasListElement.appendChild(materiaItem);
        });
    }

    toggleSeleccionarMateria(materia) {
        const materiaExistente = this.materiasSeleccionadas.find(m => m.codigo === materia.codigo);
        
        if (materiaExistente) {
            // Si ya está seleccionada, la quitamos
            this.materiasSeleccionadas = this.materiasSeleccionadas.filter(m => m.codigo !== materia.codigo);
            const materiaItem = document.querySelector(`.materia-item[data-codigo="${materia.codigo}"]`);
            if (materiaItem) {
                materiaItem.classList.remove('selected');
            }
        } else {
            // Si no está seleccionada, la agregamos
            this.materiasSeleccionadas.push({...materia, notaEstimada: 0});
            const materiaItem = document.querySelector(`.materia-item[data-codigo="${materia.codigo}"]`);
            if (materiaItem) {
                materiaItem.classList.add('selected');
            }
        }
        
        this.actualizarMateriasSeleccionadas();
    }

    actualizarMateriasSeleccionadas() {
        // Limpiar contenedor
        this.materiasSeleccionadasElement.innerHTML = '';
        
        if (this.materiasSeleccionadas.length === 0) {
            this.materiasSeleccionadasElement.innerHTML = '<div class="empty-state">No has seleccionado materias aún</div>';
            this.totalCreditosElement.textContent = '0';
            return;
        }
        
        // Ordenar por código
        const materiasOrdenadas = [...this.materiasSeleccionadas].sort((a, b) => a.codigo.localeCompare(b.codigo));
        
        // Total de créditos
        const totalCreditos = materiasOrdenadas.reduce((sum, materia) => sum + materia.creditos, 0);
        this.totalCreditosElement.textContent = totalCreditos.toFixed(1);
        
        // Mostrar materias seleccionadas
        materiasOrdenadas.forEach(materia => {
            const materiaItem = document.createElement('div');
            materiaItem.className = 'materia-seleccionada';
            
            materiaItem.innerHTML = `
                <div class="materia-info">
                    <div class="materia-codigo">${materia.codigo}</div>
                    <div class="materia-nombre">${materia.descripcion}</div>
                </div>
                <div class="materia-input-container">
                    <input type="number" class="nota-estimada" 
                        data-codigo="${materia.codigo}" 
                        min="0" max="5" step="0.1" placeholder="Nota"
                        value="${materia.notaEstimada || ''}"
                    >
                    <button class="btn-remove-materia" data-codigo="${materia.codigo}">❌</button>
                </div>
            `;
            
            this.materiasSeleccionadasElement.appendChild(materiaItem);
            
            // Eventos para botón de eliminar y campo de nota
            const btnRemove = materiaItem.querySelector('.btn-remove-materia');
            btnRemove.addEventListener('click', (e) => {
                e.stopPropagation();
                const codigo = btnRemove.dataset.codigo;
                this.quitarMateriaSeleccionada(codigo);
            });
            
            const notaInput = materiaItem.querySelector('.nota-estimada');
            notaInput.addEventListener('input', (e) => {
                const codigo = e.target.dataset.codigo;
                const nota = parseFloat(e.target.value);
                this.actualizarNotaEstimada(codigo, nota);
            });
        });
    }

    quitarMateriaSeleccionada(codigo) {
        this.materiasSeleccionadas = this.materiasSeleccionadas.filter(m => m.codigo !== codigo);
        
        // Quitar clase selected
        const materiaItem = document.querySelector(`.materia-item[data-codigo="${codigo}"]`);
        if (materiaItem) {
            materiaItem.classList.remove('selected');
        }
        
        this.actualizarMateriasSeleccionadas();
    }

    actualizarNotaEstimada(codigo, nota) {
        const materiaIndex = this.materiasSeleccionadas.findIndex(m => m.codigo === codigo);
        if (materiaIndex !== -1) {
            this.materiasSeleccionadas[materiaIndex].notaEstimada = isNaN(nota) ? 0 : nota;
        }
    }

    filtrarMateriasPendientes() {
        const textoBusqueda = this.filtroMateriasInput.value.toLowerCase().trim();
        const materias = this.materiasListElement.querySelectorAll('.materia-item');
        
        materias.forEach(materia => {
            const codigo = materia.dataset.codigo.toLowerCase();
            const descripcion = materia.dataset.descripcion.toLowerCase();
            
            if (codigo.includes(textoBusqueda) || descripcion.includes(textoBusqueda)) {
                materia.classList.remove('hidden');
            } else {
                materia.classList.add('hidden');
            }
        });
    }

    filtrarMateriasAprobadas() {
        const textoBusqueda = this.filtroAprobadasInput.value.toLowerCase().trim();
        const filas = this.materiasAprobadasElement.querySelectorAll('tr');
        
        filas.forEach(fila => {
            const codigo = fila.dataset.codigo?.toLowerCase() || '';
            const descripcion = fila.dataset.descripcion?.toLowerCase() || '';
            
            if (codigo.includes(textoBusqueda) || descripcion.includes(textoBusqueda)) {
                fila.classList.remove('hidden');
            } else {
                fila.classList.add('hidden');
            }
        });
    }

    calcularNotaNecesariaParaMeta(promedioMeta) {
        // Si no hay materias seleccionadas, no podemos calcular
        if (this.materiasSeleccionadas.length === 0) {
            return null;
        }
        
        // Total de créditos de las materias seleccionadas
        const creditosSeleccionados = this.materiasSeleccionadas.reduce((sum, materia) => sum + materia.creditos, 0);
        
        // Total de créditos después de aprobar las seleccionadas
        const creditosTotales = this.creditosAprobados + creditosSeleccionados;
        
        // Cálculo de la suma total de puntos actuales (nota * créditos)
        const puntosTotalesActuales = this.promedioPonderadoActual * this.creditosAprobados;
        
        // Cálculo de puntos necesarios para alcanzar la meta
        const puntosTotalesNecesarios = promedioMeta * creditosTotales;
        
        // Puntos que deben aportar las nuevas materias
        const puntosNecesariosNuevasMaterias = puntosTotalesNecesarios - puntosTotalesActuales;
        
        // Nota promedio necesaria en las nuevas materias
        const notaPromedioNecesaria = puntosNecesariosNuevasMaterias / creditosSeleccionados;
        
        return {
            notaPromedioNecesaria,
            creditosSeleccionados,
            creditosTotales,
            puntosTotalesActuales,
            puntosTotalesNecesarios,
            puntosNecesariosNuevasMaterias
        };
    }

    calcularProyeccion() {
        // Validar que haya un valor para la meta
        const promedioMeta = parseFloat(this.promedioMetaInput.value);
        if (isNaN(promedioMeta) || promedioMeta < 3.0 || promedioMeta > 5.0) {
            this.mostrarError(this.promedioMetaInput, 'Promedio debe estar entre 3.0 y 5.0');
            return;
        }
        
        this.limpiarError(this.promedioMetaInput);
        
        // Validar que haya materias seleccionadas
        if (this.materiasSeleccionadas.length === 0) {
            this.mensajeProyeccionElement.innerHTML = `
                <div class="proyeccion-alerta">
                    Debes seleccionar al menos una materia para calcular la proyección.
                </div>
            `;
            return;
        }
        
        // Calcular nota necesaria
        const resultado = this.calcularNotaNecesariaParaMeta(promedioMeta);
        
        if (!resultado) {
            return;
        }
        
        const { notaPromedioNecesaria, creditosSeleccionados } = resultado;
        
        // Preparar el mensaje según el resultado
        let mensaje = '';
        
        if (notaPromedioNecesaria <= 0) {
            // Ya alcanzó la meta
            mensaje = `
                <div class="proyeccion-exito">
                    <strong>¡Felicidades!</strong> Ya has superado el promedio objetivo de ${promedioMeta.toFixed(2)}.
                    Tu promedio actual de ${this.promedioPonderadoActual.toFixed(2)} es suficiente.
                </div>
            `;
        } else if (notaPromedioNecesaria <= 5.0) {
            // Es posible alcanzar la meta
            const dificultad = this.evaluarDificultadMeta(notaPromedioNecesaria);
            let clase = 'proyeccion-exito';
            let mensajeDificultad = '¡Es una meta alcanzable!';
            
            if (dificultad === 'media') {
                clase = 'proyeccion-alerta';
                mensajeDificultad = 'Es desafiante pero posible.';
            } else if (dificultad === 'alta') {
                clase = 'proyeccion-alerta';
                mensajeDificultad = 'Es muy desafiante, tendrás que esforzarte mucho.';
            }
            
            mensaje = `
                <div>
                    <p>Para alcanzar un promedio de <strong>${promedioMeta.toFixed(2)}</strong> necesitas:</p>
                    <p class="${clase}" style="font-size: 1.2rem; margin: 10px 0;">
                        Obtener un promedio de <strong>${notaPromedioNecesaria.toFixed(2)}</strong> 
                        en las ${this.materiasSeleccionadas.length} materias seleccionadas 
                        (${creditosSeleccionados.toFixed(1)} créditos).
                    </p>
                    <p>${mensajeDificultad}</p>
                    
                    <div style="margin-top: 15px;">
                        <p><strong>Distribución de notas recomendada:</strong></p>
                        ${this.generarDistribucionNotas(notaPromedioNecesaria)}
                    </div>
                </div>
            `;
        } else {
            // Es matemáticamente imposible
            mensaje = `
                <div class="proyeccion-imposible">
                    <p><strong>Meta inalcanzable:</strong> Matemáticamente es imposible alcanzar un promedio de ${promedioMeta.toFixed(2)}.</p>
                    <p>Necesitarías obtener un promedio de ${notaPromedioNecesaria.toFixed(2)} en las materias seleccionadas, 
                    pero la nota máxima posible es 5.0.</p>
                    <p style="margin-top: 10px;">Opciones:</p>
                    <ul>
                        <li>Reajusta tu meta a un valor más realista</li>
                        <li>Selecciona más materias para distribuir mejor el esfuerzo</li>
                    </ul>
                </div>
            `;
        }
        
        this.mensajeProyeccionElement.innerHTML = mensaje;
    }

    evaluarDificultadMeta(notaNecesaria) {
        if (notaNecesaria <= 3.8) return 'baja';
        if (notaNecesaria <= 4.5) return 'media';
        return 'alta';
    }

    generarDistribucionNotas(promedio) {
        if (this.materiasSeleccionadas.length === 0) return '';
        
        // Generar una distribución de notas basada en los créditos de cada materia
        let notasDistribuidas = [];
        
        // Ordenar materias por créditos (de mayor a menor)
        const materiasOrdenadas = [...this.materiasSeleccionadas].sort((a, b) => b.creditos - a.creditos);
        
        // Total de créditos
        const totalCreditos = materiasOrdenadas.reduce((sum, materia) => sum + materia.creditos, 0);
        
        // Distribuir notas, dando un poco más peso a las materias con más créditos
        materiasOrdenadas.forEach((materia, index) => {
            // Calcular factor de distribución
            const factorImportancia = materia.creditos / totalCreditos;
            
            // Ajustar nota según importancia de la materia
            let notaAsignada;
            if (index === 0) {
                // Primera materia (mayor créditos) un poco por encima del promedio
                notaAsignada = Math.min(5.0, promedio + (0.3 * factorImportancia * 5));
            } else if (index < materiasOrdenadas.length / 3) {
                // Primer tercio ligeramente por encima
                notaAsignada = Math.min(5.0, promedio + (0.1 * factorImportancia * 5));
            } else if (index < materiasOrdenadas.length * 2/3) {
                // Segundo tercio cercano al promedio
                notaAsignada = promedio;
            } else {
                // Último tercio un poco por debajo
                notaAsignada = Math.max(3.0, promedio - (0.2 * factorImportancia * 5));
            }
            
            notasDistribuidas.push({
                codigo: materia.codigo,
                descripcion: materia.descripcion,
                creditos: materia.creditos,
                nota: notaAsignada
            });
        });
        
        // Verificar que el promedio ponderado de las notas distribuidas sea el deseado
        let sumaProductos = 0;
        notasDistribuidas.forEach(materia => {
            sumaProductos += materia.nota * materia.creditos;
        });
        
        const promedioPonderadoResultante = sumaProductos / totalCreditos;
        
        // Ajustar si hay diferencia
        if (Math.abs(promedioPonderadoResultante - promedio) > 0.01) {
            const factor = promedio / promedioPonderadoResultante;
            notasDistribuidas.forEach(materia => {
                materia.nota = Math.min(5.0, materia.nota * factor);
            });
        }
        
        // Generar HTML con la tabla de distribución
        return `
            <table style="width: 100%; margin-top: 10px; border-collapse: collapse;">
                <thead>
                    <tr>
                        <th style="text-align: left; padding: 8px; border-bottom: 1px solid #ddd;">Materia</th>
                        <th style="text-align: center; padding: 8px; border-bottom: 1px solid #ddd;">Créditos</th>
                        <th style="text-align: center; padding: 8px; border-bottom: 1px solid #ddd;">Nota Sugerida</th>
                    </tr>
                </thead>
                <tbody>
                    ${notasDistribuidas.map(materia => `
                        <tr>
                            <td style="text-align: left; padding: 8px; border-bottom: 1px solid #eee;">
                                ${materia.descripcion}
                            </td>
                            <td style="text-align: center; padding: 8px; border-bottom: 1px solid #eee;">
                                ${materia.creditos.toFixed(1)}
                            </td>
                            <td style="text-align: center; padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">
                                ${materia.nota.toFixed(1)}
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    }

    mostrarError(input, mensaje) {
        input.classList.add('error');
        const errorSpan = input.parentElement.querySelector('.error-message');
        if (errorSpan) {
            errorSpan.textContent = mensaje;
            errorSpan.style.display = 'block';
        }
    }

    limpiarError(input) {
        input.classList.remove('error');
        const errorSpan = input.parentElement.querySelector('.error-message');
        if (errorSpan) {
            errorSpan.style.display = 'none';
            errorSpan.textContent = '';
        }
    }
}

// Inicializar calculadora cuando el DOM esté cargado
document.addEventListener('DOMContentLoaded', () => {
    const calculadora = new CalculadoraPromedio();
});
