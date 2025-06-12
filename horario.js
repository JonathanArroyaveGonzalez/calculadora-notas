class GestorHorarios {
    constructor() {
        this.cursos = [];
        this.cursoActual = {
            nombre: '',
            color: '#4facfe',
            horarios: []
        };
        this.contadorHorarioId = 0;
        this.cursoEditando = null;
        this.horasDelDia = this.generarHorasDelDia();
        this.diasSemana = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];

        this.initElementos();
        this.initEventListeners();
        this.initHorarioGrid();
        this.cargarCursos();
        this.actualizarVistaHorario();
    }

    initElementos() {
        // Elementos del formulario
        this.nombreInput = document.getElementById('curso-nombre');
        this.colorInput = document.getElementById('curso-color');
        this.diaSelect = document.getElementById('dia-select');
        this.horaInicioSelect = document.getElementById('hora-inicio');
        this.horaFinSelect = document.getElementById('hora-fin');
        this.agregarHorarioBtn = document.getElementById('agregar-horario');
        this.guardarCursoBtn = document.getElementById('guardar-curso');
        this.horariosPreview = document.getElementById('horarios-preview');
        this.cursosList = document.getElementById('cursos-list');
        this.horarioBody = document.getElementById('horario-body');
        this.conflictosList = document.getElementById('conflictos-list');
    }

    initEventListeners() {
        this.agregarHorarioBtn.addEventListener('click', () => this.agregarHorarioAlCurso());
        this.guardarCursoBtn.addEventListener('click', () => this.guardarCurso());
        this.nombreInput.addEventListener('input', () => this.cursoActual.nombre = this.nombreInput.value);
        this.colorInput.addEventListener('input', () => this.cursoActual.color = this.colorInput.value);

        // Asegurar que la hora de fin sea mayor a la de inicio
        this.horaInicioSelect.addEventListener('change', () => {
            const horaInicio = this.horaInicioSelect.value;
            const horaFin = this.horaFinSelect.value;
            
            if (this.compararHoras(horaInicio, horaFin) >= 0) {
                // Si la hora de inicio es mayor o igual a la de fin, ajustar hora fin
                const indexInicio = Array.from(this.horaInicioSelect.options).findIndex(opt => opt.value === horaInicio);
                if (indexInicio < this.horaFinSelect.options.length - 1) {
                    this.horaFinSelect.value = this.horaFinSelect.options[indexInicio + 1].value;
                }
            }
        });
    }

    initHorarioGrid() {
        // Crear filas de horario (7:00 a 21:00)
        let html = '';
        
        this.horasDelDia.forEach((hora, index) => {
            if (index === this.horasDelDia.length - 1) return; // Omitir la última hora (solo como límite)
            
            html += `
                <div class="horario-row" data-hora="${hora}">
                    <div class="horario-time">${hora}</div>
                    ${this.diasSemana.map(dia => `<div class="dia-column" data-dia="${dia}" data-hora="${hora}"></div>`).join('')}
                </div>
            `;
        });
        
        this.horarioBody.innerHTML = html;
    }

    generarHorasDelDia() {
        // Generar arreglo de horas de 7:00 a 21:00
        const horas = [];
        for (let i = 7; i <= 21; i++) {
            horas.push(`${i}:00`);
        }
        return horas;
    }

    agregarHorarioAlCurso() {
        const dia = this.diaSelect.value;
        const horaInicio = this.horaInicioSelect.value;
        const horaFin = this.horaFinSelect.value;
        
        // Validar que la hora de fin sea mayor a la de inicio
        if (this.compararHoras(horaInicio, horaFin) >= 0) {
            this.mostrarError('La hora de fin debe ser mayor a la hora de inicio');
            return;
        }
        
        const id = this.contadorHorarioId++;
        const nuevoHorario = { id, dia, horaInicio, horaFin };
        
        this.cursoActual.horarios.push(nuevoHorario);
        this.actualizarHorariosPreview();
    }

    actualizarHorariosPreview() {
        if (this.cursoActual.horarios.length === 0) {
            this.horariosPreview.innerHTML = '<div class="empty-state">No hay horarios agregados para este curso</div>';
            return;
        }
        
        let html = '';
        this.cursoActual.horarios.forEach(horario => {
            html += `
                <div class="horario-item">
                    <div class="horario-info">
                        ${this.capitalizarPrimeraLetra(horario.dia)} | ${horario.horaInicio} - ${horario.horaFin}
                    </div>
                    <button class="btn-remove" onclick="gestor.eliminarHorario(${horario.id})">❌</button>
                </div>
            `;
        });
        
        this.horariosPreview.innerHTML = html;
    }

    eliminarHorario(id) {
        this.cursoActual.horarios = this.cursoActual.horarios.filter(h => h.id !== id);
        this.actualizarHorariosPreview();
    }

    guardarCurso() {
        // Validar nombre
        if (!this.cursoActual.nombre.trim()) {
            this.mostrarError('Debes asignar un nombre al curso');
            return;
        }
        
        // Validar que tenga al menos un horario
        if (this.cursoActual.horarios.length === 0) {
            this.mostrarError('Debes agregar al menos un horario para el curso');
            return;
        }
        
        if (this.cursoEditando !== null) {
            // Editar curso existente
            this.cursos[this.cursoEditando] = JSON.parse(JSON.stringify(this.cursoActual));
        } else {
            // Agregar nuevo curso
            this.cursos.push(JSON.parse(JSON.stringify(this.cursoActual)));
        }
        
        // Guardar cursos en localStorage
        localStorage.setItem('cursos', JSON.stringify(this.cursos));
        
        // Actualizar visualizaciones
        this.actualizarListaCursos();
        this.actualizarVistaHorario();
        this.resetearFormulario();
        this.mostrarMensajeExito('Curso guardado correctamente');
    }

    resetearFormulario() {
        this.cursoActual = {
            nombre: '',
            color: '#4facfe',
            horarios: []
        };
        this.cursoEditando = null;
        
        // Restablecer elementos del formulario
        this.nombreInput.value = '';
        this.colorInput.value = '#4facfe';
        this.actualizarHorariosPreview();
        
        // Cambiar texto del botón
        this.guardarCursoBtn.textContent = 'GUARDAR CURSO ✓';
    }

    actualizarListaCursos() {
        if (this.cursos.length === 0) {
            this.cursosList.innerHTML = '<div class="empty-state">No hay cursos agregados. Comienza agregando uno arriba.</div>';
            return;
        }
        
        let html = '';
        this.cursos.forEach((curso, index) => {
            const horarioTexto = curso.horarios.map(h => 
                `${this.capitalizarPrimeraLetra(h.dia)} ${h.horaInicio}-${h.horaFin}`
            ).join(', ');
            
            html += `
                <div class="curso-card" style="border-top-color: ${curso.color}">
                    <div class="curso-title">${curso.nombre}</div>
                    <div class="curso-horarios">${horarioTexto}</div>
                    <div class="curso-actions">
                        <button class="btn-edit" onclick="gestor.editarCurso(${index})">✏️ Editar</button>
                        <button class="btn-delete" onclick="gestor.eliminarCurso(${index})">🗑️ Eliminar</button>
                    </div>
                </div>
            `;
        });
        
        this.cursosList.innerHTML = html;
    }

    editarCurso(index) {
        const curso = this.cursos[index];
        
        this.cursoActual = JSON.parse(JSON.stringify(curso));
        this.cursoEditando = index;
        
        // Actualizar elementos del formulario
        this.nombreInput.value = curso.nombre;
        this.colorInput.value = curso.color;
        this.actualizarHorariosPreview();
        
        // Cambiar texto del botón
        this.guardarCursoBtn.textContent = 'ACTUALIZAR CURSO ✓';
        
        // Desplazar a la parte superior para ver el formulario
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    eliminarCurso(index) {
        if (confirm('¿Estás seguro de eliminar este curso?')) {
            this.cursos.splice(index, 1);
            
            // Actualizar localStorage
            localStorage.setItem('cursos', JSON.stringify(this.cursos));
            
            // Actualizar vistas
            this.actualizarListaCursos();
            this.actualizarVistaHorario();
            
            if (this.cursoEditando === index) {
                this.resetearFormulario();
            }
        }
    }

    cargarCursos() {
        const cursosGuardados = localStorage.getItem('cursos');
        
        if (cursosGuardados) {
            this.cursos = JSON.parse(cursosGuardados);
            this.actualizarListaCursos();
        }
    }

    actualizarVistaHorario() {
        // Primero, limpia todas las celdas del horario
        this.limpiarVistaHorario();
        
        // Luego, coloca cada curso en el horario
        const conflictos = this.colocarCursosEnHorario();
        
        // Actualizar la sección de conflictos
        this.mostrarConflictos(conflictos);
    }

    limpiarVistaHorario() {
        // Eliminar todos los bloques de curso
        document.querySelectorAll('.curso-block').forEach(bloque => bloque.remove());
    }

    colocarCursosEnHorario() {
        const conflictos = [];
        
        // Mapear las posiciones de todos los cursos para detectar conflictos
        const mapaHorario = {};
        
        // Primero, registrar todos los horarios en el mapa para detectar conflictos
        this.cursos.forEach(curso => {
            curso.horarios.forEach(horario => {
                const indices = this.obtenerIndicesHorarios(horario.horaInicio, horario.horaFin);
                const dia = horario.dia;
                
                indices.forEach(indice => {
                    const key = `${dia}-${indice}`;
                    
                    if (!mapaHorario[key]) {
                        mapaHorario[key] = [];
                    }
                    
                    mapaHorario[key].push({
                        curso: curso.nombre,
                        horario: `${horario.horaInicio} - ${horario.horaFin}`
                    });
                    
                    // Si hay más de un curso en la misma celda, es un conflicto
                    if (mapaHorario[key].length > 1) {
                        conflictos.push({
                            dia: this.capitalizarPrimeraLetra(dia),
                            hora: this.horasDelDia[indice],
                            cursos: mapaHorario[key]
                        });
                    }
                });
            });
        });
        
        // Ahora, colocar los bloques visuales en el horario
        this.cursos.forEach(curso => {
            curso.horarios.forEach(horario => {
                this.colocarBloqueHorario(curso, horario, mapaHorario);
            });
        });
        
        // Eliminar duplicados de conflictos basados en día y hora
        const conflictosUnicos = [];
        const keys = new Set();
        
        conflictos.forEach(conflicto => {
            const key = `${conflicto.dia}-${conflicto.hora}`;
            if (!keys.has(key)) {
                keys.add(key);
                conflictosUnicos.push(conflicto);
            }
        });
        
        return conflictosUnicos;
    }

    colocarBloqueHorario(curso, horario, mapaHorario) {
        const dia = horario.dia;
        const horaInicio = horario.horaInicio;
        const horaFin = horario.horaFin;
        
        const indiceFila = this.horasDelDia.indexOf(horaInicio);
        if (indiceFila === -1) return;
        
        const indiceColumna = this.diasSemana.indexOf(dia);
        if (indiceColumna === -1) return;
        
        // Encontrar celda correspondiente
        const celda = document.querySelector(`.horario-row[data-hora="${horaInicio}"] .dia-column[data-dia="${dia}"]`);
        if (!celda) return;
        
        // Calcular altura del bloque en base a la duración
        const indiceInicio = this.horasDelDia.indexOf(horaInicio);
        const indiceFin = this.horasDelDia.indexOf(horaFin);
        const altura = (indiceFin - indiceInicio) * 60; // Altura en píxeles (cada hora son 60px)
        
        // Crear bloque
        const bloque = document.createElement('div');
        bloque.className = 'curso-block';
        bloque.style.backgroundColor = curso.color;
        bloque.style.top = '0';
        bloque.style.height = `${altura}px`;
        
        // Comprobar si hay conflicto
        const indices = this.obtenerIndicesHorarios(horaInicio, horaFin);
        let tieneConflicto = false;
        
        for (const indice of indices) {
            const key = `${dia}-${indice}`;
            if (mapaHorario[key] && mapaHorario[key].length > 1) {
                tieneConflicto = true;
                break;
            }
        }
        
        if (tieneConflicto) {
            bloque.classList.add('conflicto');
        }
        
        // Contenido
        bloque.innerHTML = `
            <div class="curso-nombre">${curso.nombre}</div>
            <div class="curso-hora">${horaInicio} - ${horaFin}</div>
        `;
        
        // Agregar tooltip
        bloque.title = `${curso.nombre}\n${this.capitalizarPrimeraLetra(dia)}: ${horaInicio} - ${horaFin}`;
        
        // Evento de clic
        bloque.addEventListener('click', () => {
            const index = this.cursos.findIndex(c => c.nombre === curso.nombre);
            if (index !== -1) {
                this.editarCurso(index);
            }
        });
        
        celda.appendChild(bloque);
    }

    obtenerIndicesHorarios(horaInicio, horaFin) {
        const indiceInicio = this.horasDelDia.indexOf(horaInicio);
        const indiceFin = this.horasDelDia.indexOf(horaFin);
        const indices = [];
        
        for (let i = indiceInicio; i < indiceFin; i++) {
            indices.push(i);
        }
        
        return indices;
    }

    mostrarConflictos(conflictos) {
        if (conflictos.length === 0) {
            this.conflictosList.innerHTML = '<div class="empty-state">No hay conflictos en tu horario</div>';
            return;
        }
        
        let html = '';
        conflictos.forEach(conflicto => {
            const cursosTexto = conflicto.cursos.map(c => `${c.curso} (${c.horario})`).join(' y ');
            
            html += `
                <div class="conflicto-item">
                    <strong>${conflicto.dia} ${conflicto.hora}</strong>: 
                    Conflicto entre ${cursosTexto}
                </div>
            `;
        });
        
        this.conflictosList.innerHTML = html;
    }

    compararHoras(hora1, hora2) {
        const [h1] = hora1.split(':').map(Number);
        const [h2] = hora2.split(':').map(Number);
        
        if (h1 < h2) return -1;
        if (h1 > h2) return 1;
        return 0;
    }

    capitalizarPrimeraLetra(texto) {
        return texto.charAt(0).toUpperCase() + texto.slice(1);
    }

    mostrarError(mensaje) {
        alert(mensaje);
    }

    mostrarMensajeExito(mensaje) {
        alert(mensaje);
    }
}

// Inicializar el gestor de horarios
const gestor = new GestorHorarios();
