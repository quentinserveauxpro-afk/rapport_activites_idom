(() => {
    'use strict';

    const MKEY = 'idom-months-v2';
    const TKEY = 'idom-todos-v2';

    const MONTH_NAMES = [
        'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
        'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
    ];

    const defaults = [
        {
            id: 1,
            name: '2027-09',
            tag: 'Intégration & compréhension',
            context: "Découverte d’IDOM Technologies, de ses outils, de l’équipe et de l’environnement de travail.",
            activities: [
                {
                    title: "Comprendre l’outil Tools",
                    details: "Analyse du code, des scripts, de la documentation et des liaisons avec les bases de données."
                },
                {
                    title: "Corriger l’import de factures VOIP",
                    details: "Correction de la conversion d’encodage afin de préserver les caractères spéciaux."
                },
                {
                    title: "Rédiger la documentation de Tools",
                    details: "Cartographie des fonctions, scripts, flux et dépendances."
                }
            ],
            skills: [
                'PHP et CakePHP 3',
                'Architecture applicative',
                'Wamp, MariaDB, MySQL et tunnels SSH',
                'Documentation technique'
            ],
            analysis: "Ce mois a montré l’importance de la logique métier et d’une documentation complète.",
            perspectives: [
                'Terminer la documentation de Tools',
                'Construire le plan de mise à jour'
            ]
        },
        {
            id: 2,
            name: '2027-10',
            tag: 'Modernisation & tests',
            context: "Début de la modernisation de Tools après l’étude de son architecture.",
            activities: [
                {
                    title: "Corriger l’interface des routeurs",
                    details: "Affichage de « Normal » ou « Anomalies » selon les indicateurs réseau."
                },
                {
                    title: "Mettre à jour CakePHP 3.7.5 vers 3.7.9",
                    details: "Installation de Composer et mise à jour de plugin-installer."
                },
                {
                    title: "Créer un environnement Elasticsearch local",
                    details: "Reproduction des index, champs et types nécessaires aux tests."
                },
                {
                    title: "Mettre en place un environnement de tests",
                    details: "Simulation de MySQL, LDAP, API, SSH, Shell et Elasticsearch avec Docker et des mocks."
                }
            ],
            skills: [
                'Composer et dépendances',
                'Elasticsearch',
                'Docker et mocks',
                'Diagnostic méthodique'
            ],
            analysis: "La faible couverture de tests augmente la dette technique et oblige à sécuriser la trajectoire de migration.",
            perspectives: [
                'Construire une couverture de tests complète',
                'Préparer la migration vers CakePHP 4'
            ]
        }
    ];

    const defaultTodos = [
        { id: 11, text: 'MàJ Tools vers CakePHP 5', done: false }
    ];

    /* ---------- Éléments HTML ---------- */

    function required(selector) {
        const node = document.querySelector(selector);
        if (!node) console.error(`Élément "${selector}" introuvable.`);
        return node;
    }

    const monthsEl = required('#months');
    const monthForm = required('#monthForm');
    const todoForm = required('#todoForm');
    const todoBody = required('#todoBody');
    const taskInput = required('#taskInput');
    const saveMonthButton = required('#saveMonthButton');
    const cancelEditButton = required('#cancelEditButton');
    const fields = {
        name: required('#monthName'),
        tag: required('#monthTag'),
        context: required('#context'),
        activities: required('#activities'),
        skills: required('#skills'),
        analysis: required('#analysis'),
        perspectives: required('#perspectives')
    };

    // Éléments facultatifs : leur absence ne bloque pas l'application.
    const todoCounter = document.querySelector('#todoCounter');
    const formTitle = document.querySelector('#monthFormTitle');
    const creatorSection = document.querySelector('#creator');
    const printBtn = document.querySelector('#printBtn');

    /* ---------- Outils ---------- */

    const lines = value => String(value || '')
        .split(/\r?\n/)
        .map(x => x.trim())
        .filter(Boolean);

    const toText = value => (typeof value === 'string' ? value : '');

    const toList = value => {
        if (Array.isArray(value)) return value.map(x => String(x).trim()).filter(Boolean);
        if (typeof value === 'string') return lines(value);
        return [];
    };

    const stripAccents = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

    // Convertit "2027-09" ou "Septembre 2027" en "2027-09". Renvoie null sinon.
    function toIsoMonth(value) {
        const v = toText(value).trim();
        if (/^\d{4}-(0[1-9]|1[0-2])$/.test(v)) return v;
        const match = stripAccents(v).match(/^([a-z]+)\s+(\d{4})$/);
        if (!match) return null;
        const index = MONTH_NAMES.findIndex(n => stripAccents(n) === match[1]);
        return index === -1 ? null : `${match[2]}-${String(index + 1).padStart(2, '0')}`;
    }

    // Affiche "2027-09" sous la forme "Septembre 2027".
    function formatMonth(value) {
        const iso = toIsoMonth(value);
        if (!iso) return toText(value) || 'Mois non renseigné';
        const [year, month] = iso.split('-');
        return `${MONTH_NAMES[Number(month) - 1]} ${year}`;
    }

    function el(tag, cls, text) {
        const n = document.createElement(tag);
        if (cls) n.className = cls;
        if (text !== undefined) n.textContent = text;
        return n;
    }

    function button(label, cls, onClick) {
        const b = el('button', cls, label);
        b.type = 'button';
        b.addEventListener('click', onClick);
        return b;
    }

    function uniqueId(list) {
        let id = Date.now();
        while (list.some(x => x.id === id)) id++;
        return id;
    }

    /* ---------- Stockage ---------- */

    function read(key, fallback) {
        try {
            const raw = localStorage.getItem(key);
            if (raw === null) return clone(fallback);
            const value = JSON.parse(raw);
            return Array.isArray(value) ? value : clone(fallback);
        } catch (err) {
            console.warn(`Données "${key}" illisibles, valeurs par défaut utilisées.`, err);
            return clone(fallback);
        }
    }

    function clone(value) {
        return JSON.parse(JSON.stringify(value));
    }

    function save() {
        try {
            localStorage.setItem(MKEY, JSON.stringify(months));
            localStorage.setItem(TKEY, JSON.stringify(todos));
        } catch (err) {
            console.error('Impossible de sauvegarder dans localStorage.', err);
        }
    }

    // Migration légère : complète les propriétés manquantes et convertit
    // les anciens libellés ("Septembre 2027") en valeur ISO ("2027-09").
    function normalizeMonths(list) {
        const seen = new Set();
        return list
            .filter(m => m && typeof m === 'object')
            .map(m => {
                let id = Number(m.id);
                if (!Number.isFinite(id) || seen.has(id)) {
                    id = Date.now() + seen.size;
                    while (seen.has(id)) id++;
                }
                seen.add(id);
                return {
                    id,
                    name: toIsoMonth(m.name) || toText(m.name),
                    tag: toText(m.tag),
                    context: toText(m.context),
                    activities: (Array.isArray(m.activities) ? m.activities : [])
                        .map(a => (typeof a === 'string'
                            ? { title: a.trim(), details: '' }
                            : { title: toText(a && a.title).trim(), details: toText(a && a.details) }))
                        .filter(a => a.title),
                    skills: toList(m.skills),
                    analysis: toText(m.analysis),
                    perspectives: toList(m.perspectives)
                };
            });
    }

    function normalizeTodos(list) {
        return list
            .filter(t => t && typeof t === 'object' && toText(t.text).trim())
            .map((t, i) => ({
                id: Number.isFinite(Number(t.id)) ? Number(t.id) : Date.now() + i,
                text: toText(t.text).trim(),
                done: Boolean(t.done)
            }));
    }

    let months = normalizeMonths(read(MKEY, defaults));
    let todos = normalizeTodos(read(TKEY, defaultTodos));
    let editedMonthId = null;

    /* ---------- Rendu des fiches ---------- */

    function list(items) {
        const ul = el('ul');
        items.forEach(x => ul.append(el('li', '', x)));
        return ul;
    }

    function section(title, content, isList = false) {
        const s = el('section', 'section');
        s.append(el('h3', '', title));
        const b = el('div', 'box');
        if (isList && content.length) b.append(list(content));
        else b.append(document.createTextNode((isList ? '' : content) || 'À compléter'));
        s.append(b);
        return s;
    }

    function renderActivity(month, activity, index) {
        const box = el('article', 'activity');
        box.append(el('h4', '', `Activité n°${index + 1} · ${activity.title}`));

        const body = el('div', 'activity-body');
        const text = el('div', '', activity.details || 'À compléter');
        const area = el('textarea');
        area.value = activity.details || '';
        area.hidden = true;

        const edit = button('Modifier', '', () => {
            const editing = area.hidden;
            area.hidden = !editing;
            text.hidden = editing;
            edit.textContent = editing ? 'Enregistrer' : 'Modifier';
            if (editing) {
                area.focus();
                return;
            }
            activity.details = area.value.trim();
            save();
            text.textContent = activity.details || 'À compléter';
        });

        const del = button('Supprimer l’activité', 'danger', () => {
            month.activities.splice(index, 1);
            save();
            // Garde le formulaire synchronisé si cette fiche est en cours de modification.
            if (editedMonthId === month.id && fields.activities) {
                fields.activities.value = month.activities.map(a => a.title).join('\n');
            }
            renderMonths();
        });

        const actions = el('div', 'activity-actions');
        actions.append(edit, del);
        body.append(text, area, actions);
        box.append(body);
        return box;
    }

    function renderMonths() {
        if (!monthsEl) return;
        monthsEl.textContent = '';

        months.forEach((month, mi) => {
            const card = el('article', 'month');
            card.id = 'month-' + month.id;

            const head = el('div', 'month-head');
            const wrap = el('div');
            wrap.append(
                el('p', 'eyebrow', 'Mois ' + String(mi + 1).padStart(2, '0')),
                el('h2', '', formatMonth(month.name))
            );
            head.append(wrap, el('span', 'tag', month.tag));
            card.append(head, section('1. Contexte du mois', month.context));

            const acts = el('section', 'section');
            acts.append(el('h3', '', '2. Activités réalisées'));
            month.activities.forEach((a, ai) => acts.append(renderActivity(month, a, ai)));
            if (!month.activities.length) acts.append(el('div', 'box', 'À compléter'));

            card.append(
                acts,
                section('3. Connaissances et compétences acquises', month.skills, true),
                section('4. Analyse personnelle', month.analysis),
                section('5. Perspectives', month.perspectives, true)
            );

            const editButton = button('Modifier', 'edit-card', () => editMonth(month));
            const deleteButton = button('Supprimer cette fiche', 'danger delete-card', () => {
                if (!confirm(`Supprimer la fiche « ${formatMonth(month.name)} » ?`)) return;
                months = months.filter(x => x.id !== month.id);
                save();
                if (editedMonthId === month.id) resetMonthForm();
                renderMonths();
            });

            const cardActions = el('div', 'card-actions');
            cardActions.append(editButton, deleteButton);
            card.append(cardActions);
            monthsEl.append(card);
        });
    }

    /* ---------- Formulaire des fiches ---------- */

    function editMonth(month) {
        if (!monthForm) return;
        editedMonthId = month.id;

        if (fields.name) fields.name.value = toIsoMonth(month.name) || '';
        if (fields.tag) fields.tag.value = month.tag;
        if (fields.context) fields.context.value = month.context;
        if (fields.activities) fields.activities.value = month.activities.map(a => a.title).join('\n');
        if (fields.skills) fields.skills.value = month.skills.join('\n');
        if (fields.analysis) fields.analysis.value = month.analysis;
        if (fields.perspectives) fields.perspectives.value = month.perspectives.join('\n');

        if (saveMonthButton) saveMonthButton.textContent = 'Enregistrer les modifications';
        if (cancelEditButton) cancelEditButton.hidden = false;
        if (formTitle) formTitle.textContent = `Modifier la fiche « ${formatMonth(month.name)} »`;

        (creatorSection || monthForm).scrollIntoView({ behavior: 'smooth' });
    }

    function resetMonthForm() {
        editedMonthId = null;
        if (monthForm) monthForm.reset();
        if (fields.name) fields.name.setCustomValidity('');
        if (saveMonthButton) saveMonthButton.textContent = 'Créer la fiche';
        if (cancelEditButton) cancelEditButton.hidden = true;
        if (formTitle) formTitle.textContent = 'Créer une fiche mensuelle';
    }

    // Conserve les détails : d'abord par titre identique, puis par position
    // si l'ancienne activité à cette position a été renommée.
    function mergeActivities(titles, previous) {
        const used = new Set();
        return titles.map((title, i) => {
            let idx = previous.findIndex((a, j) => !used.has(j) && a.title === title);
            if (idx === -1 && previous[i] && !used.has(i) && !titles.includes(previous[i].title)) {
                idx = i;
            }
            if (idx !== -1) used.add(idx);
            return { title, details: idx !== -1 ? previous[idx].details || '' : '' };
        });
    }

    function readMonthForm() {
        const value = field => (field ? field.value.trim() : '');
        return {
            name: toIsoMonth(value(fields.name)),
            tag: value(fields.tag),
            context: value(fields.context),
            titles: lines(fields.activities && fields.activities.value),
            skills: lines(fields.skills && fields.skills.value),
            analysis: value(fields.analysis),
            perspectives: lines(fields.perspectives && fields.perspectives.value)
        };
    }

    function onMonthSubmit(e) {
        e.preventDefault();
        const data = readMonthForm();

        if (fields.name) {
            fields.name.setCustomValidity(data.name ? '' : 'Choisissez un mois et une année.');
            if (!data.name) {
                fields.name.reportValidity();
                return;
            }
        }
        if (!data.name || !data.tag || !data.context || !data.titles.length) {
            monthForm.reportValidity();
            return;
        }

        let target;
        if (editedMonthId === null) {
            target = {
                id: uniqueId(months),
                name: data.name,
                tag: data.tag,
                context: data.context,
                activities: data.titles.map(title => ({ title, details: '' })),
                skills: data.skills,
                analysis: data.analysis,
                perspectives: data.perspectives
            };
            months.push(target);
        } else {
            target = months.find(m => m.id === editedMonthId);
            if (!target) {
                console.error('Fiche en cours de modification introuvable.');
                resetMonthForm();
                return;
            }
            Object.assign(target, {
                name: data.name,
                tag: data.tag,
                context: data.context,
                activities: mergeActivities(data.titles, target.activities),
                skills: data.skills,
                analysis: data.analysis,
                perspectives: data.perspectives
            });
        }

        save();
        renderMonths();
        resetMonthForm();

        const card = document.querySelector('#month-' + target.id);
        if (card) card.scrollIntoView({ behavior: 'smooth' });
    }

    /* ---------- Todo-list ---------- */

    function renderTodos() {
        if (!todoBody) return;
        todoBody.textContent = '';

        todos.forEach(t => {
            const tr = el('tr', t.done ? 'done' : '');

            const check = el('input');
            check.type = 'checkbox';
            check.checked = t.done;
            check.addEventListener('change', () => {
                t.done = check.checked;
                save();
                renderTodos();
            });

            const c1 = el('td');
            c1.append(check);
            const c2 = el('td', 'task', t.text);
            const c3 = el('td');
            c3.append(button('Supprimer', 'danger', () => {
                todos = todos.filter(x => x.id !== t.id);
                save();
                renderTodos();
            }));

            tr.append(c1, c2, c3);
            todoBody.append(tr);
        });

        if (todoCounter) {
            const n = todos.filter(x => !x.done).length;
            todoCounter.textContent = `${n} tâche${n > 1 ? 's' : ''} restante${n > 1 ? 's' : ''}`;
        }
    }

    function onTodoSubmit(e) {
        e.preventDefault();
        if (!taskInput) return;
        const text = taskInput.value.trim();
        if (!text) return;
        todos.push({ id: uniqueId(todos), text, done: false });
        taskInput.value = '';
        save();
        renderTodos();
    }

    /* ---------- Écouteurs (ajoutés une seule fois) ---------- */

    if (todoForm) todoForm.addEventListener('submit', onTodoSubmit);
    if (monthForm) monthForm.addEventListener('submit', onMonthSubmit);
    if (fields.name) fields.name.addEventListener('input', () => fields.name.setCustomValidity(''));
    if (printBtn) printBtn.addEventListener('click', () => window.print());
    if (cancelEditButton) cancelEditButton.addEventListener('click', resetMonthForm);

    renderMonths();
    renderTodos();
})();
