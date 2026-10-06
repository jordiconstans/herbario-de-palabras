"""Corrección única del contenido importado desde Claude Chat (revisión del 6 oct 2026)."""
import json

p = 'datos/palabras.json'
d = json.load(open(p, encoding='utf-8'))
W = {x['palabra']: x for x in d}

# Fonética unificada: transcripción fonológica con seseo (español de Chile).
F = {'Véspero': '/ˈbes.pe.ɾo/', 'Quimera': '/kiˈme.ɾa/', 'Cariz': '/kaˈɾis/', 'Némesis': '/ˈne.me.sis/',
     'Mímesis': '/ˈmi.me.sis/', 'Artesiano': '/aɾ.teˈsja.no/', 'Artefacto': '/aɾ.teˈfak.to/',
     'Hipérbole': '/iˈpeɾ.bo.le/', 'Hipérbaton': '/iˈpeɾ.ba.ton/', 'Metáfora': '/meˈta.fo.ɾa/',
     'Infula': '/ˈin.fu.la/', 'Ludita': '/luˈdi.ta/', 'Poliedro': '/poˈlje.dɾo/', 'Vicario': '/biˈka.ɾjo/',
     'Persignarse': '/peɾ.sigˈnaɾ.se/', 'Vigente': '/biˈxen.te/', 'Etcétera': '/etˈse.te.ɾa/',
     'Marabunta': '/ma.ɾaˈbun.ta/', 'Providencia': '/pɾo.biˈden.sja/', 'Denante': '/deˈnan.te/',
     'Divorcio': '/diˈboɾ.sjo/', 'Escaque': '/esˈka.ke/', 'Gravitas': '/ˈgɾa.bi.tas/',
     'Contumaz': '/kon.tuˈmas/', 'Impía': '/imˈpi.a/', 'Bártulos': '/ˈbaɾ.tu.los/',
     'Heurístico': '/eu̯ˈɾis.ti.ko/', 'Áncora': '/ˈan.ko.ɾa/', 'Picapedrero': '/pi.ka.peˈdɾe.ɾo/',
     'Batiscafo': '/ba.tisˈka.fo/', 'Prognosis': '/pɾogˈno.sis/', 'Esguince': '/esˈgin.se/',
     'Certidumbre': '/seɾ.tiˈdum.bɾe/', 'Hiato': '/ˈja.to/', 'Diptongo': '/dipˈton.go/',
     'Celibato': '/se.liˈba.to/', 'Abscisa': '/absˈsi.sa/', 'Idilio': '/iˈdi.ljo/',
     'Laticinio': '/lak.tiˈsi.njo/', 'Elucubrar': '/e.lu.kuˈbɾaɾ/'}
for k, v in F.items():
    W[k]['fonetica'] = v


def r(w, f, a, b):
    assert a in W[w][f], (w, f, a)
    W[w][f] = W[w][f].replace(a, b)


def s(w, f, t):
    W[w][f] = t


s('Artefacto', 'etimologia', "De la expresión latina arte factus: 'hecho con arte', de ars (arte, oficio) + factus (hecho). La raíz es la misma de 'artificio' y 'artificial'. En origen, simplemente: lo hecho con arte, con técnica. Luego pasó a significar lo viejo y rescatable, lo que el tiempo vuelve enigmático.")
s('Infula', 'significado', "Banda, cinta o venda sagrada, especialmente la que portaban los sacerdotes romanos en ceremonias. Símbolo de autoridad ritual y consagración. En plural, 'ínfulas': presunción, vanidad — 'darse ínfulas' es comportarse como si uno llevara esa cinta sin tenerla.")
s('Infula', 'etimologia', "Del latín infula: venda sacerdotal, cinta ritual. Era el atributo visible del poder sacro — no se podía ver la autoridad, pero sí la cinta que la marcaba. De ahí el plural figurado 'ínfulas': aires de importancia, pretensiones.")
r('Poliedro', 'etimologia', "πολύ (polí: muchos)", "πολύς (polýs: mucho)")
s('Marabunta', 'significado', "Migración masiva de hormigas legionarias (como las del género Eciton) que avanzan en columna devorando todo a su paso. Por extensión: multitud desorganizada pero irresistible que arrasa, que avanza sin control. Ejército de lo pequeño que se vuelve potencia.")
s('Marabunta', 'etimologia', "Origen incierto. Es voz del español de América tropical; se ha propuesto un origen africano o indígena, pero ninguna hipótesis está demostrada. Se difundió ampliamente a mediados del siglo XX, en buena parte gracias al cine ('Cuando ruge la marabunta', 1954).")
r('Providencia', 'etimologia', "En la Edad Media pasó a significar el cuidado de Dios sobre la creación.", "Los estoicos ya hablaban de una providencia que gobierna el mundo, y la tradición cristiana la hizo cuidado de Dios sobre la creación.")
s('Denante', 'etimologia', "Variante de 'denantes', formada por de + enantes ('antes'), y esta del latín in ante. Tuvo esplendor en el español medieval y clásico; hoy es desusada en la mayoría de países, pero sigue viva en el habla coloquial de Chile y otras zonas de América.")
r('Divorcio', 'etimologia', "En origen, los romanos usaban 'divortium' para designar incluso tierras separadas por un brazo de mar, donde cada orilla se dirigía hacia un lado opuesto.", "Los romanos usaban 'divortium' también para el punto donde un camino se bifurca o donde las aguas se separan hacia vertientes opuestas (divortium aquarum).")
s('Escaque', 'etimologia', "Voz emparentada con 'jaque', llegada a través del árabe hispánico desde el persa šāh (rey). De esa misma raíz real vienen 'jaque', 'jaque mate' y, por el juego, el inglés 'check' y 'cheque'. Lo que comenzó nombrando al rey en persa terminó nombrando los cuadros de su tablero en español. (El paso exacto de 'jaque' a 'escaque' es discutido.)")
r('Gravitas', 'etimologia', "protoindoeuropea gru-", "protoindoeuropea *gʷerh₂-")
r('Gravitas', 'etimologia', "al griego barus", "al griego barýs")
r('Heurístico', 'etimologia', "El pretérito perfecto de este verbo es 'eureka'", "Su perfecto, εὕρηκα (héurēka), es el célebre 'eureka'")
r('Áncora', 'etimologia', "ἀγκυρα (anchyra)", "ἄγκυρα (ánkyra)")
r('Áncora', 'etimologia', "la raíz griega está emparentada con 'ankos' (ángulo, rincón)", "la raíz griega se asocia a la idea de lo curvo, del gancho")
r('Picapedrero', 'etimologia', " La palabra data de al menos 1604 en los diccionarios españoles, testimoniando una profesión de larga tradición en la construcción.", "")
r('Batiscafo', 'etimologia', "El cultismo fue creado en 1946 por el inventor suizo Auguste Piccard (1884-1962), quien realizó la primera inmersión en 1948 en aguas del archipiélago de Cabo Verde. La RAE lo incorporó en su edición de 1970.", "El nombre lo acuñó el físico suizo Auguste Piccard (1884-1962) para el vehículo con que exploró las profundidades marinas a fines de los años cuarenta.")
r('Prognosis', 'etimologia', "Término técnico de largo abolengo: aparecía ya en Hipócrates (siglo V a.C.). Pasó al latín tardío y fue reintroducido como cultismo moderno en 1917 en la RAE.", "Término técnico de largo abolengo: 'Pronóstico' es el título de uno de los tratados hipocráticos (siglos V-IV a.C.). Pasó al latín tardío y de ahí al español como cultismo.")
s('Esguince', 'etimologia', "De esguinzar, y este del latín vulgar *exquintiare (desgarrar, rasgar). Originalmente significaba 'rasgar' — de ahí la idea de algo que se tuerce y se rasga en la articulación. El sentido del quiebro del cuerpo para esquivar un golpe es antiguo; el médico se impuso después.")
r('Esguince', 'aura', "tambié ", "también ")
r('Certidumbre', 'etimologia', "Documentada desde 1495 en el Vocabulario español-latino. ", "")
r('Hiato', 'significado', "La contrario", "Lo contrario")
s('Abscisa', 'etimologia', "Del latín abscissa (linea), 'línea cortada', participio femenino de abscindere (cortar, separar), de ab- + scindere (cortar). El término se generalizó en el siglo XVII con la geometría analítica. La palabra porta en sí su significado: es el segmento que se 'corta' sobre el eje horizontal desde el origen.")
s('Laticinio', 'etimologia', "Del latín lacticinium, derivado de lac, lactis (leche). En su origen: la leche y todo lo que se hace con ella. Pariente de 'lácteo', 'lactancia' y 'lechuga' (por su jugo blanco).")
r('Laticinio', 'aura', "los laticínios", "los lacticinios")
r('Elucubrar', 'etimologia', "Lucubrāre procede de lucubrum (lamparita pequeña para alumbrarse de noche), formado con lux (luz).", "Lucubrāre se relaciona con lux (luz): velar trabajando a la luz de una lámpara.")
r('Elucubrar', 'etimologia', "La variante más antigua es lucubrar (documentada desde 1658), mientras que elucubrar fue admitida por la Academia recién en 1984.", "La variante más antigua es 'lucubrar'; 'elucubrar' es posterior y hoy la más usada.")

# Esencias (frase breve) enviadas por la autora.
E = {'Diptongo': 'la unión fonética más íntima', 'Celibato': 'libertad o renunciamiento, según se mire',
     'Abscisa': 'la línea que mapea el espacio invisible', 'Idilio': 'la belleza de lo imaginado',
     'Laticinio': 'manos que ordeñan y cuajan', 'Elucubrar': 'vigilia mental hasta el agotamiento'}
for k, v in E.items():
    W[k]['esencia'] = v

W['Infula']['palabra'] = 'Ínfula'
W['Laticinio']['palabra'] = 'Lacticinio'

d.append({
    'palabra': 'Baladí', 'fonetica': '/ba.laˈdi/', 'categoria': 'Adjetivo', 'fecha': '2026-06-02',
    'significado': "De poca importancia, insustancial, trivial. Se dice de lo que no merece mayor atención: 'una discusión baladí', 'un asunto baladí'.",
    'etimologia': "Del árabe hispánico baladí, y este del árabe clásico baladī: 'del país, local, del lugar', derivado de balad (país, tierra). En al-Ándalus designaba lo producido en la tierra propia, frente a lo importado y apreciado; de 'lo de aquí, lo corriente' pasó a significar 'lo de poco valor'.",
    'aura': 'pendiente',
    'esencia': 'lo trivial nombrado sin desprecio',
})
d.sort(key=lambda x: x['fecha'])
with open(p, 'w', encoding='utf-8') as f:
    json.dump(d, f, ensure_ascii=False, indent=2)
    f.write('\n')
print(len(d), 'palabras')
