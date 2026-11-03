(()=>{
    'use strict';
    const MKEY='idom-months-v2',TKEY='idom-todos-v2';
    const defaults=[{id:1,
                    name:'Septembre 2027',
                    tag:'Intégration & compréhension',
                    context:"Découverte d’IDOM Technologies, de ses outils, de l’équipe et de l’environnement de travail.",
                    activities:[{title:"Comprendre l’outil Tools",details:"Analyse du code, des scripts, de la documentation et des liaisons avec les bases de données."},
                                {title:"Corriger l’import de factures VOIP",details:"Correction de la conversion d’encodage afin de préserver les caractères spéciaux."},
                                {title:"Rédiger la documentation de Tools",details:"Cartographie des fonctions, scripts, flux et dépendances."}
                                ],

                    skills:['PHP et CakePHP 3',
                            'Architecture applicative',
                            'Wamp, MariaDB, MySQL et tunnels SSH',
                            'Documentation technique'
                            ],

                    analysis:"Ce mois a montré l’importance de la logique métier et d’une documentation complète.",
                    perspectives:['Terminer la documentation de Tools',
                                'Construire le plan de mise à jour'
                                ]},
                                {id:2,
                                name:'Octobre 2027',
                                tag:'Modernisation & tests',
                                context:"Début de la modernisation de Tools après l’étude de son architecture.",
                                activities:[{title:"Corriger l’interface des routeurs",
                                            details:"Affichage de « Normal » ou « Anomalies » selon les indicateurs réseau."
                                            },
                                            {title:"Mettre à jour CakePHP 3.7.5 vers 3.7.9",
                                            details:"Installation de Composer et mise à jour de plugin-installer."
                                            },
                                            {title:"Créer un environnement Elasticsearch local",
                                            details:"Reproduction des index, champs et types nécessaires aux tests."
                                            },
                                            {title:"Mettre en place un environnement de tests",
                                            details:"Simulation de MySQL, LDAP, API, SSH, Shell et Elasticsearch avec Docker et des mocks."
                                        }],
                                skills:['Composer et dépendances',
                                        'Elasticsearch',
                                        'Docker et mocks',
                                        'Diagnostic méthodique'
                                        ],
                                analysis:"La faible couverture de tests augmente la dette technique et oblige à sécuriser la trajectoire de migration.",
                                perspectives:['Construire une couverture de tests complète',
                                            'Préparer la migration vers CakePHP 4']}
                                        ];
    const read=(k,f)=>{try{
        const v=JSON.parse(localStorage.getItem(k));
        return Array.isArray(v)?v:f
    }
    catch{return f}},
    save=()=>{localStorage.setItem(MKEY,JSON.stringify(months));
        localStorage.setItem(TKEY,JSON.stringify(todos))},
        line=v=>v.split('').map(x=>x.trim()).filter(Boolean);let months=read(MKEY,defaults),todos=read(TKEY,[{id:11,text:'MàJ Tools vers CakePHP 5',month:'Septembre 2027',done:false}]);const monthsEl=document.querySelector('#months'),select=document.querySelector('#taskMonth');function el(tag,cls,text){const n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=text;return n}function list(items){const ul=el('ul');items.forEach(x=>ul.append(el('li','',x)));return ul}function section(title,content,isList=false){const s=el('section','section');s.append(el('h3','',title));const b=el('div','box');b.append(isList?list(content):document.createTextNode(content||'À compléter'));s.append(b);return s}function renderMonths(){monthsEl.textContent='';select.textContent='';months.forEach((m,mi)=>{select.append(new Option(m.name,m.name));const card=el('article','month');card.id='month-'+m.id;const head=el('div','month-head'),wrap=el('div');wrap.append(el('p','eyebrow','Mois '+String(mi+1).padStart(2,'0')),el('h2','',m.name));head.append(wrap,el('span','tag',m.tag));card.append(head,section('1. Contexte du mois',m.context));const acts=el('section','section');acts.append(el('h3','','2. Activités réalisées'));m.activities.forEach((a,ai)=>{const box=el('article','activity');box.append(el('h4','',`Activité n°${ai+1} · ${a.title}`));const body=el('div','activity-body');const text=el('div','',a.details||'À compléter');const area=el('textarea');area.value=a.details||'';area.hidden=true;const actions=el('div','activity-actions');const edit=el('button','','Modifier');edit.type='button';edit.onclick=()=>{area.hidden=!area.hidden;text.hidden=!text.hidden;edit.textContent=area.hidden?'Modifier':'Enregistrer';if(area.hidden){a.details=area.value.trim();save();text.textContent=a.details||'À compléter'}};const del=el('button','danger','Supprimer l’activité');del.type='button';del.onclick=()=>{m.activities.splice(ai,1);save();renderMonths()};actions.append(edit,del);body.append(text,area,actions);box.append(body);acts.append(box)});card.append(acts,section('3. Connaissances et compétences acquises',m.skills,true),section('4. Analyse personnelle',m.analysis),section('5. Perspectives',m.perspectives,true));const del=el('button','danger delete-card','Supprimer cette fiche');del.type='button';del.onclick=()=>{if(confirm(`Supprimer la fiche « ${m.name} » ?`)){months=months.filter(x=>x.id!==m.id);save();renderMonths();renderTodos()}};card.append(del);monthsEl.append(card)})}const body=document.querySelector('#todoBody'),counter=document.querySelector('#todoCounter');function renderTodos(){body.textContent='';todos.forEach(t=>{const tr=el('tr',t.done?'done':'');const check=el('input');check.type='checkbox';check.checked=t.done;check.onchange=()=>{t.done=check.checked;save();renderTodos()};const c1=el('td');c1.append(check);const c2=el('td','task',t.text),c3=el('td','',t.month),c4=el('td'),del=el('button','danger','Supprimer');del.type='button';del.onclick=()=>{todos=todos.filter(x=>x.id!==t.id);save();renderTodos()};c4.append(del);tr.append(c1,c2,c3,c4);body.append(tr)});const n=todos.filter(x=>!x.done).length;counter.textContent=`${n} tâche${n>1?'s':''} restante${n>1?'s':''}`}document.querySelector('#todoForm').onsubmit=e=>{e.preventDefault();const i=document.querySelector('#taskInput'),v=i.value.trim();if(!v)return;todos.push({id:Date.now(),text:v,month:select.value,done:false});i.value='';save();renderTodos()};document.querySelector('#monthForm').onsubmit=e=>{e.preventDefault();const m={id:Date.now(),name:document.querySelector('#monthName').value.trim(),tag:document.querySelector('#monthTag').value.trim(),context:document.querySelector('#context').value.trim(),activities:line(document.querySelector('#activities').value).map(title=>({title,details:''})),skills:line(document.querySelector('#skills').value),analysis:document.querySelector('#analysis').value.trim(),perspectives:line(document.querySelector('#perspectives').value)};if(!m.name||!m.tag||!m.context||!m.activities.length)return;months.push(m);save();renderMonths();e.target.reset();document.querySelector('#month-'+m.id).scrollIntoView({behavior:'smooth'})};document.querySelector('#printBtn').onclick=()=>print();renderMonths();renderTodos()})();