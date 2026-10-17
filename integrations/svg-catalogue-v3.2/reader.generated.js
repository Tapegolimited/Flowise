var TobyCurriculumReader = (() => {
    var O = Object.defineProperty
    var Be = Object.getOwnPropertyDescriptor
    var Me = Object.getOwnPropertyNames
    var qe = Object.prototype.hasOwnProperty
    var Te = (t, i) => {
            for (var e in i) O(t, e, { get: i[e], enumerable: !0 })
        },
        je = (t, i, e, s) => {
            if ((i && typeof i == 'object') || typeof i == 'function')
                for (let a of Me(i)) !qe.call(t, a) && a !== e && O(t, a, { get: () => i[a], enumerable: !(s = Be(i, a)) || s.enumerable })
            return t
        }
    var Ce = (t) => je(O({}, '__esModule', { value: !0 }), t)
    var Xe = {}
    Te(Xe, {
        DIAGRAM_CATALOGUE_VERSION: () => ze,
        DIAGRAM_TEMPLATE_IDS: () => We,
        applyDiagramPolicy: () => Je,
        isCurriculumTemplate: () => _e,
        parseDiagramDescriptor: () => Ke
    })
    var z = '1.0.0'
    var $ = [
            'math.area.rectangle',
            'math.area.triangle',
            'math.area.trapezium',
            'physics.forces.single_object',
            'chemistry.particle.states',
            'biology.cell.animal',
            'biology.cell.plant',
            'math.area.parallelogram',
            'math.area.circle',
            'math.area.sector',
            'math.geometry.right_triangle',
            'math.volume.cuboid',
            'math.volume.cylinder',
            'physics.circuit.simple',
            'physics.wave.transverse',
            'physics.optics.reflection',
            'chemistry.atom.shells',
            'biology.cell.bacterial'
        ],
        Ue = {
            'biology.cell.animal': ['nucleus', 'cytoplasm', 'cell_membrane', 'mitochondria'],
            'biology.cell.plant': ['nucleus', 'cytoplasm', 'cell_membrane', 'mitochondria', 'cell_wall', 'chloroplasts', 'vacuole']
        },
        Le = {
            'math.area.rectangle': { w: 'width', h: 'height', u: 'units', sh: 'shading' },
            'math.area.triangle': { b: 'base', h: 'height', u: 'units', sh: 'shading', hp: 'heightPosition' },
            'math.area.trapezium': { a: 'topBase', b: 'bottomBase', h: 'height', u: 'units', sh: 'shading' },
            'physics.forces.single_object': { obj: 'objectLabel', f: 'forces' },
            'chemistry.particle.states': { s: 'state', c: 'compareTo' },
            'biology.cell.animal': { l: 'labels', hl: 'highlights' },
            'biology.cell.plant': { l: 'labels', hl: 'highlights' },
            'math.area.parallelogram': { b: 'base', h: 'height', u: 'units', sh: 'shading', hp: 'heightPosition' },
            'math.area.circle': { r: 'radius', d: 'diameter', u: 'units', sh: 'shading' },
            'math.area.sector': { r: 'radius', a: 'angleDegrees', u: 'units', sh: 'shading' },
            'math.geometry.right_triangle': { b: 'base', h: 'height', c: 'hypotenuse', u: 'units' },
            'math.volume.cuboid': { l: 'length', w: 'width', h: 'height', u: 'units' },
            'math.volume.cylinder': { r: 'radius', h: 'height', u: 'units' },
            'physics.circuit.simple': { top: 'topology', c: 'components', n: 'cells', sw: 'switch', l: 'labels' },
            'physics.wave.transverse': { a: 'amplitude', w: 'wavelength', u: 'units', d: 'direction' },
            'physics.optics.reflection': { i: 'incidenceAngle' },
            'chemistry.atom.shells': { z: 'atomicNumber', l: 'labels', c: 'showCounts' },
            'biology.cell.bacterial': { l: 'labels', hl: 'highlights', f: 'flagellum' }
        }
    function u(t) {
        throw new Error(`diagram: ${t}`)
    }
    function B(t, i) {
        return (
            (!t || typeof t != 'object' || Array.isArray(t) || ![Object.prototype, null].includes(Object.getPrototypeOf(t))) &&
                u(`${i} must be a plain object`),
            t
        )
    }
    function g(t, i, e) {
        for (let s of Object.keys(t)) i.includes(s) || u(`${e}.${s} is not permitted`)
    }
    function K(t, i = new Set(), e = 0) {
        if ((e > 8 && u('descriptor nesting exceeds the limit'), !(t === null || typeof t == 'string' || typeof t == 'boolean'))) {
            if (typeof t == 'number') {
                Number.isFinite(t) || u('numbers must be finite')
                return
            }
            ;(!t || typeof t != 'object') && u('descriptor must contain JSON data only'),
                i.has(t) && u('descriptor cannot contain cycles'),
                Array.isArray(t) || B(t, 'descriptor'),
                i.add(t)
            for (let s of Object.keys(t)) {
                ;['__proto__', 'constructor', 'prototype'].includes(s) && u('unsafe object key')
                let a = Object.getOwnPropertyDescriptor(t, s)
                ;(!a || !('value' in a)) && u('descriptor accessors are not permitted'), K(a.value, i, e + 1)
            }
            i.delete(t)
        }
    }
    function v(t, i, e = 1e3) {
        return (typeof t != 'number' || !Number.isFinite(t) || t < 0.1 || t > e) && u(`${i} must be between 0.1 and ${e}`), t
    }
    function h(t, i, e) {
        return (typeof t != 'string' || !i.includes(t)) && u(`${e} is not supported`), t
    }
    function W(t, i, e) {
        return (
            (typeof t != 'string' ||
                !t.trim() ||
                t.length > i ||
                t !== t.trim() ||
                Array.from(t).some((s) => s.charCodeAt(0) < 32 || s.charCodeAt(0) === 127) ||
                /[<>]|(?:https?:|data:|javascript:|vbscript:|file:)|%[A-Z][A-Z0-9_]*%/i.test(t)) &&
                u(`${e} must be plain text of 1-${i} characters`),
            t
        )
    }
    var Pe = ['cell_wall', 'cell_membrane', 'cytoplasm', 'chromosomal_dna', 'plasmid', 'ribosomes', 'flagellum']
    function R(t, i, e, s) {
        return (typeof t != 'number' || !Number.isFinite(t) || t < i || t > e) && u(`${s} must be between ${i} and ${e}`), t
    }
    function U(t, i, e) {
        Object.hasOwn(t, i) && (typeof t[i] != 'boolean' && u(`${i} must be boolean`), (e[i] = t[i]))
    }
    function Ee(t, i) {
        let e = B(i, 'parameters')
        if (
            [
                'math.area.parallelogram',
                'math.area.circle',
                'math.area.sector',
                'math.geometry.right_triangle',
                'math.volume.cuboid',
                'math.volume.cylinder'
            ].includes(t)
        ) {
            let a = {
                'math.area.parallelogram': ['base', 'height', 'units', 'shading', 'heightPosition'],
                'math.area.circle': ['radius', 'diameter', 'units', 'shading'],
                'math.area.sector': ['radius', 'angleDegrees', 'units', 'shading'],
                'math.geometry.right_triangle': ['base', 'height', 'hypotenuse', 'units'],
                'math.volume.cuboid': ['length', 'width', 'height', 'units'],
                'math.volume.cylinder': ['radius', 'height', 'units']
            }
            g(e, a[t], 'parameters')
            let r = { units: h(e.units, ['mm', 'cm', 'm'], 'units') },
                n = a[t].filter((o) => !['units', 'shading', 'heightPosition', 'angleDegrees'].includes(o))
            for (let o of n)
                t === 'math.area.circle' || t === 'math.geometry.right_triangle'
                    ? Object.hasOwn(e, o) && (r[o] = v(e[o], o))
                    : (r[o] = v(e[o], o))
            if (
                (Object.hasOwn(e, 'shading') && (r.shading = h(e.shading, ['region', 'none'], 'shading')),
                Object.hasOwn(e, 'heightPosition') && (r.heightPosition = h(e.heightPosition, ['inside', 'outside'], 'heightPosition')),
                t === 'math.area.circle' &&
                    Number(Object.hasOwn(r, 'radius')) + Number(Object.hasOwn(r, 'diameter')) !== 1 &&
                    u('circle requires exactly one given radius or diameter'),
                t === 'math.area.sector' && (r.angleDegrees = R(e.angleDegrees, 1, 359, 'angleDegrees')),
                t === 'math.geometry.right_triangle')
            ) {
                let { base: o, height: l, hypotenuse: c } = r
                if (
                    (n.filter((f) => Object.hasOwn(r, f)).length < 2 && u('right triangle requires two or three given lengths'),
                    c !== void 0 && ((o !== void 0 && c <= o) || (l !== void 0 && c <= l)) && u('hypotenuse must exceed each supplied leg'),
                    o !== void 0 && l !== void 0 && c !== void 0)
                ) {
                    let f = o * o + l * l,
                        C = c * c
                    Math.abs(C - f) > 1e-6 * Math.max(C, f, 1) && u('right triangle given lengths are inconsistent')
                }
            }
            return r
        }
        if (t === 'physics.circuit.simple') {
            g(e, ['topology', 'components', 'cells', 'switch', 'labels'], 'parameters')
            let a = h(e.topology, ['series', 'parallel'], 'topology')
            ;(!Array.isArray(e.components) || e.components.length < (a === 'parallel' ? 2 : 1) || e.components.length > 3) &&
                u('circuit requires 1-3 series or 2-3 parallel components')
            let r = { topology: a, components: e.components.map((n) => h(n, ['lamp', 'resistor'], 'component')) }
            return (
                Object.hasOwn(e, 'cells') && (e.cells !== 1 && e.cells !== 2 && u('cells must be 1 or 2'), (r.cells = e.cells)),
                Object.hasOwn(e, 'switch') && (r.switch = h(e.switch, ['none', 'open', 'closed'], 'switch')),
                U(e, 'labels', r),
                r
            )
        }
        if (t === 'physics.wave.transverse') {
            g(e, ['amplitude', 'wavelength', 'units', 'direction'], 'parameters')
            let a = {}
            for (let r of ['amplitude', 'wavelength']) Object.hasOwn(e, r) && (a[r] = v(e[r], r))
            return (
                Object.hasOwn(a, 'amplitude') || Object.hasOwn(a, 'wavelength')
                    ? (a.units = h(e.units, ['mm', 'cm', 'm'], 'units'))
                    : Object.hasOwn(e, 'units') && u('wave units require a given measurement'),
                Object.hasOwn(e, 'direction') && (a.direction = h(e.direction, ['left', 'right'], 'direction')),
                a
            )
        }
        if (t === 'physics.optics.reflection')
            return g(e, ['incidenceAngle'], 'parameters'), { incidenceAngle: R(e.incidenceAngle, 0, 89, 'incidenceAngle') }
        if (t === 'chemistry.atom.shells') {
            g(e, ['atomicNumber', 'labels', 'showCounts'], 'parameters')
            let a = R(e.atomicNumber, 1, 20, 'atomicNumber')
            Number.isInteger(a) || u('atomicNumber must be an integer')
            let r = { atomicNumber: a }
            return U(e, 'labels', r), U(e, 'showCounts', r), r
        }
        if (t === 'biology.cell.bacterial') {
            g(e, ['labels', 'highlights', 'flagellum'], 'parameters')
            let a = {}
            if ((U(e, 'labels', a), U(e, 'flagellum', a), Object.hasOwn(e, 'highlights'))) {
                ;(!Array.isArray(e.highlights) || e.highlights.length > 3) && u('highlights accepts at most 3 structures')
                let r = e.highlights.map((n) => h(n, Pe, 'highlight'))
                new Set(r).size !== r.length && u('highlights must be unique'),
                    r.includes('flagellum') && a.flagellum !== !0 && u('flagellum highlight requires a shown flagellum'),
                    (a.highlights = r)
            }
            return a
        }
        if (t.startsWith('math.area.')) {
            g(
                e,
                t === 'math.area.rectangle'
                    ? ['width', 'height', 'units', 'shading']
                    : t === 'math.area.triangle'
                    ? ['base', 'height', 'units', 'shading', 'heightPosition']
                    : ['topBase', 'bottomBase', 'height', 'units', 'shading'],
                'parameters'
            )
            let r = h(e.units, ['mm', 'cm', 'm'], 'units'),
                n = v(e.height, 'height'),
                o = {}
            if ((e.shading !== void 0 && (o.shading = h(e.shading, ['region', 'none'], 'shading')), t === 'math.area.rectangle'))
                return { width: v(e.width, 'width'), height: n, units: r, ...o }
            if (t === 'math.area.triangle')
                return (
                    e.heightPosition !== void 0 && (o.heightPosition = h(e.heightPosition, ['inside', 'outside'], 'heightPosition')),
                    { base: v(e.base, 'base'), height: n, units: r, ...o }
                )
            let l = v(e.topBase, 'topBase'),
                c = v(e.bottomBase, 'bottomBase')
            return (
                l === c && u('trapezium bases must differ; use the rectangle template for a rectangular region'),
                { topBase: l, bottomBase: c, height: n, units: r, ...o }
            )
        }
        if (t === 'physics.forces.single_object') {
            g(e, ['objectLabel', 'forces'], 'parameters')
            let a = W(e.objectLabel, 48, 'objectLabel')
            ;(!Array.isArray(e.forces) || e.forces.length < 1 || e.forces.length > 4) && u('forces requires 1-4 arrows')
            let r = new Set(),
                n = e.forces.map((o, l) => {
                    let c = B(o, `forces[${l}]`)
                    g(c, ['direction', 'label', 'magnitude', 'unit'], `forces[${l}]`)
                    let p = h(c.direction, ['up', 'down', 'left', 'right'], 'direction')
                    r.has(p) && u('force directions must be unique in this template'), r.add(p)
                    let f = { direction: p, label: W(c.label, 32, 'force label') }
                    return (
                        c.magnitude !== void 0
                            ? ((f.magnitude = v(c.magnitude, 'magnitude', 1e4)), (f.unit = h(c.unit, ['N'], 'unit')))
                            : c.unit !== void 0 && u('force unit requires a magnitude'),
                        f
                    )
                })
            return { objectLabel: a, forces: n }
        }
        if (t === 'chemistry.particle.states') {
            g(e, ['state', 'compareTo'], 'parameters')
            let a = h(e.state, ['solid', 'liquid', 'gas'], 'state')
            if (e.compareTo === void 0) return { state: a }
            let r = h(e.compareTo, ['solid', 'liquid', 'gas'], 'compareTo')
            return r === a && u('comparison requires two different particle states'), { state: a, compareTo: r }
        }
        g(e, ['labels', 'highlights'], 'parameters')
        let s = {}
        if (
            (e.labels !== void 0 && (typeof e.labels != 'boolean' && u('labels must be boolean'), (s.labels = e.labels)),
            e.highlights !== void 0)
        ) {
            ;(!Array.isArray(e.highlights) || e.highlights.length > 3) && u('highlights accepts at most 3 structures')
            let a = Ue[t]
            ;(s.highlights = e.highlights.map((r) => h(r, a, 'highlight'))),
                new Set(s.highlights).size !== s.highlights.length && u('highlights must be unique')
        }
        return s
    }
    function $e(t, i) {
        let e = B(i, 'p'),
            s = Le[t]
        g(e, Object.keys(s), 'p')
        let a = {}
        for (let [r, n] of Object.entries(e)) a[s[r]] = n
        return (
            t === 'physics.forces.single_object' &&
                Array.isArray(a.forces) &&
                (a.forces = a.forces.map((r) => {
                    let n = B(r, 'force'),
                        o = {},
                        l = { d: 'direction', l: 'label', m: 'magnitude', u: 'unit' }
                    g(n, Object.keys(l), 'force')
                    for (let [c, p] of Object.entries(n)) o[l[c]] = p
                    return o
                })),
            a
        )
    }
    function J(t) {
        K(t)
        let i = JSON.stringify(t)
        new TextEncoder().encode(i).byteLength > 12e3 && u('descriptor exceeds 12000 UTF-8 bytes')
        let e = B(t, 'descriptor'),
            s = Object.hasOwn(e, 'v')
        g(e, s ? ['v', 't', 'p', 'view'] : ['schemaVersion', 'templateId', 'templateVersion', 'parameters', 'variant'], 'descriptor'),
            (s ? e.v : e.schemaVersion) !== 1 && u('schema version must be 1')
        let a, r
        if (s) {
            typeof e.t != 'string' && u('t requires a versioned template identifier')
            let l = e.t.split('@')
            l.length !== 2 && u('t requires template@version'), (a = h(l[0], $, 'templateId')), (r = l[1])
        } else (a = h(e.templateId, $, 'templateId')), (r = e.templateVersion)
        r !== z && u('template version is not supported')
        let n = h(s ? (e.view === void 0 ? 'hint' : e.view) : e.variant, ['labelled', 'hint', 'blank'], 'variant'),
            o = Ee(a, s ? $e(a, e.p) : e.parameters)
        return { schemaVersion: 1, templateId: a, templateVersion: z, parameters: o, variant: n }
    }
    function x(t) {
        throw new Error('diagram: ' + t)
    }
    function L(t, i = new Set(), e = 0) {
        if ((e > 8 && x('descriptor nesting exceeds the limit'), !(t === null || typeof t == 'string' || typeof t == 'boolean'))) {
            if (typeof t == 'number') {
                Number.isFinite(t) || x('numbers must be finite')
                return
            }
            ;(!t || typeof t != 'object') && x('descriptor must contain JSON data only'),
                i.has(t) && x('descriptor cannot contain cycles'),
                !Array.isArray(t) && ![Object.prototype, null].includes(Object.getPrototypeOf(t)) && x('descriptor must be a plain object'),
                i.add(t)
            for (let s of Reflect.ownKeys(t)) {
                typeof s != 'string' && x('descriptor must contain JSON data only'),
                    ['__proto__', 'constructor', 'prototype'].includes(s) && x('unsafe object key')
                let a = Object.getOwnPropertyDescriptor(t, s)
                ;(!a || !('value' in a)) && x('descriptor accessors are not permitted'), L(a.value, i, e + 1)
            }
            i.delete(t)
        }
    }
    var X = {
        'biology.neural.synapse': {
            title: 'Synapse close-up',
            subtopicIds: [50],
            gap: 'STEM-01',
            kind: 'new-family',
            subject: 'Biology',
            relatedTemplates: ['biology.neural.neurone', 'biology.neural.reflex'],
            purpose: 'Existing nerve/reflex views do not expose the junction.',
            adaptation: 'Presynaptic ending, cleft, vesicles, receptors, selected transmission state, visible labels.',
            limitation: 'Simplified junction; electrical impulses and chemical transmission are distinct. Not to scale.',
            acceptance:
                'One-way transmission; chemical signal in the cleft distinguished from electrical impulses in neurones; no invented neuronal measurements.',
            fields: {
                labels: { choices: ['names', 'letters', 'none'] },
                state: { choices: ['rest', 'release', 'binding'] },
                vesicles: { min: 3, max: 6, integer: !0 }
            },
            examples: [
                { labels: 'names', state: 'rest', vesicles: 4 },
                { labels: 'letters', state: 'binding', vesicles: 4 }
            ],
            status: 'review-candidate',
            eligibility: 'board-tier-review-required'
        },
        'biology.cell.meiosis_overview': {
            title: 'Meiosis chromosome comparison',
            subtopicIds: [39, 55],
            gap: 'STEM-02',
            kind: 'new-family',
            subject: 'Biology',
            relatedTemplates: ['biology.cell.mitosis'],
            purpose: 'Current mitosis snapshots do not represent reduction division.',
            adaptation: 'Bounded chromosome pairs, parental identity, overview state and selected visible labels.',
            limitation:
                'Chromosome overview; not named meiotic phases. Chromatid colours show parental origin, not a complete recombination model.',
            acceptance:
                'Chromosome conservation and halved gamete counts. GCSE overview by default; named meiotic phases/crossing-over only with board or enrichment justification.',
            fields: {
                labels: { choices: ['names', 'letters', 'none'] },
                pairs: { min: 2, max: 3, integer: !0 },
                viewStage: { choices: ['comparison', 'gametes'] },
                assortment: { choices: ['mixed', 'alternate'] }
            },
            examples: [
                { labels: 'names', pairs: 2, viewStage: 'comparison', assortment: 'mixed' },
                { labels: 'names', pairs: 3, viewStage: 'gametes', assortment: 'mixed' }
            ],
            status: 'review-candidate',
            eligibility: 'board-tier-review-required'
        },
        'biology.cell.binary_fission': {
            title: 'Bacterial binary fission',
            subtopicIds: [38, 39],
            gap: 'STEM-03',
            kind: 'new-family',
            subject: 'Biology',
            relatedTemplates: ['biology.cell.bacterial'],
            purpose: 'A bacterial cell image does not show DNA replication, elongation and division.',
            adaptation: 'Approved replication/division snapshots, circular chromosome and optional plasmids.',
            limitation: 'Bacterial division schematic; no nucleus or mitotic spindle. Use Stepper to sequence snapshots.',
            acceptance:
                'Do not draw a nucleus or use mitotic spindle machinery; no invented growth measurements. Use Stepper for ordering.',
            fields: {
                labels: { choices: ['names', 'letters', 'none'] },
                stage: { choices: ['single', 'replicated', 'dividing', 'separated'] },
                plasmids: { min: 0, max: 2, integer: !0 }
            },
            examples: [
                { labels: 'names', stage: 'single', plasmids: 1 },
                { labels: 'names', stage: 'separated', plasmids: 1 }
            ],
            status: 'review-candidate',
            eligibility: 'board-tier-review-required'
        },
        'biology.cell.osmotic_comparison': {
            title: 'Plant-cell osmotic states',
            subtopicIds: [40],
            gap: 'STEM-04',
            kind: 'new-family',
            subject: 'Biology',
            relatedTemplates: ['biology.cell.plant', 'biology.membrane.osmosis'],
            purpose: 'Membrane model lacks a wall-bounded cell with changing vacuole and membrane position.',
            adaptation: 'Turgid/flaccid/plasmolysed model state, direction of net water movement, paired supplied conditions.',
            limitation: 'Qualitative cell states; no concentration-to-volume prediction. Plasmolysis terminology is curriculum dependent.',
            acceptance:
                'Cell wall retained; membrane separation correct; morphology is schematic, not a concentration-to-volume calculation. Terminology gated to curriculum.',
            fields: {
                labels: { choices: ['names', 'letters', 'none'] },
                leftState: { choices: ['turgid', 'flaccid', 'plasmolysed'] },
                rightState: { choices: ['plasmolysed', 'flaccid', 'turgid'] },
                arrows: { choices: ['none', 'net'] }
            },
            examples: [
                { labels: 'names', leftState: 'turgid', rightState: 'plasmolysed', arrows: 'none' },
                { labels: 'names', leftState: 'flaccid', rightState: 'turgid', arrows: 'net' }
            ],
            status: 'review-candidate',
            eligibility: 'board-tier-review-required'
        },
        'biology.plant.root_section': {
            title: 'Root transverse section',
            subtopicIds: [42],
            gap: 'STEM-05',
            kind: 'new-family',
            subject: 'Biology',
            relatedTemplates: ['biology.plant.root_hair', 'biology.plant.stem_section'],
            purpose: 'Root-hair surface and stem bundle arrangement do not provide a root transverse section.',
            adaptation: 'Approved plant root type, xylem/phloem regions, root-hair inset, label policy.',
            limitation: 'Young dicot root schematic; arrangement is not universal across plant roots.',
            acceptance: 'Fix one reviewed anatomical type per version; do not imply every plant has the same arrangement.',
            fields: {
                labels: { choices: ['names', 'letters', 'none'] },
                focus: { choices: ['all', 'xylem', 'phloem', 'epidermis'] },
                rootHair: { choices: ['show', 'hide'] }
            },
            examples: [
                { labels: 'names', focus: 'all', rootHair: 'show' },
                { labels: 'letters', focus: 'xylem', rootHair: 'show' }
            ],
            status: 'review-candidate',
            eligibility: 'board-tier-review-required'
        },
        'biology.immune.lateral_flow': {
            title: 'Lateral-flow strip mechanism',
            subtopicIds: [47],
            gap: 'STEM-06',
            kind: 'new-family',
            subject: 'Biology',
            relatedTemplates: ['biology.immune.antibody'],
            purpose: 'Antibody binding exists but test-strip structure and control region do not.',
            adaptation: 'Sample pad, conjugate zone, test/control lines, capillary-flow direction, approved illustrative states.',
            limitation: 'Generic sandwich immunoassay teaching model, not a product or patient diagnosis.',
            acceptance:
                'Control-line logic explicit; no patient diagnosis or real product claims; separate-science/curriculum restrictions preserved.',
            fields: {
                labels: { choices: ['names', 'letters', 'none'] },
                state: { choices: ['unused', 'both-lines', 'control-only', 'no-control'] },
                detail: { choices: ['strip', 'binding'] }
            },
            examples: [
                { labels: 'names', state: 'unused', detail: 'strip' },
                { labels: 'names', state: 'both-lines', detail: 'binding' }
            ],
            status: 'review-candidate',
            eligibility: 'board-tier-review-required'
        },
        'chemistry.bonding.dot_cross': {
            title: 'Covalent dot-and-cross diagrams',
            subtopicIds: [63],
            gap: 'STEM-07',
            kind: 'new-family',
            subject: 'Chemistry',
            relatedTemplates: ['chemistry.atom.shells', 'chemistry.bonding.electron_transfer'],
            purpose: 'Shell atoms and ionic transfer do not expose reviewed shared-pair/lone-pair diagrams.',
            adaptation: 'Allowlisted GCSE molecules, outer-shell electrons, electron-origin markers, pair highlights, label policy.',
            limitation: 'Outer-shell electrons only. Dot/cross marks track electron origin, not different electron types.',
            acceptance: 'Count electrons and shared/lone pairs independently. Keep general molecular structures with SMILES/Ketcher.',
            fields: {
                labels: { choices: ['names', 'letters', 'none'] },
                molecule: { choices: ['H2O', 'H2', 'Cl2', 'CH4', 'NH3', 'O2', 'N2', 'CO2'] },
                highlight: { choices: ['none', 'shared', 'lone'] }
            },
            examples: [
                { labels: 'names', molecule: 'H2O', highlight: 'none' },
                { labels: 'names', molecule: 'CO2', highlight: 'shared' }
            ],
            status: 'review-candidate',
            eligibility: 'board-tier-review-required'
        },
        'chemistry.reaction.metal_displacement': {
            title: 'Metal displacement experiment',
            subtopicIds: [69],
            gap: 'STEM-08',
            kind: 'new-family',
            subject: 'Chemistry',
            relatedTemplates: ['chemistry.reaction.precipitation', 'chemistry.analysis.spot_plate'],
            purpose: 'Precipitation does not encode metal-in-salt-solution displacement.',
            adaptation: 'Reviewed metal/solution pair, supplied initial/final observation state, coating and solution appearance.',
            limitation: 'Allowlisted qualitative end states; no inferred time, completeness or measured yield.',
            acceptance:
                'Chemically coherent allowed pairs, states and observations; avoid guessing colour change or exposing the answer in an observation question.',
            fields: {
                labels: { choices: ['names', 'letters', 'none'] },
                pair: { choices: ['zinc-copper-sulfate', 'iron-copper-sulfate', 'copper-zinc-sulfate'] },
                stage: { choices: ['before', 'after'] }
            },
            examples: [
                { labels: 'names', pair: 'zinc-copper-sulfate', stage: 'before' },
                { labels: 'names', pair: 'copper-zinc-sulfate', stage: 'after' }
            ],
            status: 'review-candidate',
            eligibility: 'board-tier-review-required'
        },
        'chemistry.reaction.closed_equilibrium': {
            title: 'Reversible reaction in a closed vessel',
            subtopicIds: [75],
            gap: 'STEM-09',
            kind: 'new-family',
            subject: 'Chemistry',
            relatedTemplates: ['chemistry.reaction.collision', 'chemistry.particle.conservation'],
            purpose: 'Collision and conservation models do not express an authored reversible equilibrium state.',
            adaptation: 'Allowlisted reaction, fixed particle populations in two states, forward/reverse event markers, labels.',
            limitation:
                'Abstract 2A \u21CC A\u2082 model. An equilibrium designation is an explicit supplied condition, not inferred from populations.',
            acceptance:
                'Atoms conserved; equilibrium must not mean equal populations or motion stopping; do not infer equilibrium composition from unspecified constants.',
            fields: {
                labels: { choices: ['names', 'letters', 'none'] },
                units: { min: 4, max: 8, integer: !0 },
                dimersBefore: { min: 0, max: 4, integer: !0 },
                dimersAfter: { min: 0, max: 4, integer: !0 },
                stateAfter: { choices: ['snapshot', 'equilibrium'] }
            },
            examples: [
                { labels: 'names', units: 6, dimersBefore: 1, dimersAfter: 2, stateAfter: 'snapshot' },
                { labels: 'names', units: 6, dimersBefore: 2, dimersAfter: 1, stateAfter: 'equilibrium' }
            ],
            status: 'review-candidate',
            eligibility: 'board-tier-review-required'
        },
        'chemistry.apparatus.cracking': {
            title: 'Catalytic cracking apparatus',
            subtopicIds: [76, 318],
            gap: 'STEM-10',
            kind: 'new-family',
            subject: 'Chemistry',
            relatedTemplates: ['chemistry.apparatus.gas_syringe', 'chemistry.reaction.catalyst_surface'],
            purpose: 'Catalyst surface and collection apparatus do not supply the spatial cracking setup.',
            adaptation: 'Approved apparatus layout, separate feed/catalyst regions, collection connection, label policy.',
            limitation: 'Illustrative approved school-apparatus layout; not operating instructions. No products or quantities inferred.',
            acceptance:
                'Review continuous gas path, heating locations and unsealed outlet. Illustrative school practical, not unsupervised operating instructions.',
            fields: {
                labels: { choices: ['names', 'letters', 'none'] },
                collection: { choices: ['syringe', 'water'] },
                focus: { choices: ['all', 'feed', 'catalyst', 'collection'] }
            },
            examples: [
                { labels: 'names', collection: 'syringe', focus: 'all' },
                { labels: 'names', collection: 'water', focus: 'catalyst' }
            ],
            status: 'review-candidate',
            eligibility: 'board-tier-review-required'
        },
        'physics.measurement.analogue_meter': {
            title: 'Calibrated analogue meter',
            subtopicIds: [88, 90],
            gap: 'STEM-11',
            kind: 'new-family',
            subject: 'Physics',
            relatedTemplates: ['physics.circuit.measurement'],
            purpose: 'Meters are symbols, not readable graduated instrument faces.',
            adaptation: 'Explicit scale bounds, divisions, zero offset, pointer value, unit and visible givens.',
            limitation:
                'Pointer displays supplied indicated reading. Zero-offset inset is a separate supplied instrument observation; no corrected answer printed.',
            acceptance: 'Independent scale read-off; no pointer-value answer in alt/caption; distinguish display range from uncertainty.',
            fields: {
                labels: { choices: ['names', 'letters', 'none'] },
                maximum: { min: 1, max: 100, integer: !1 },
                majorDivisions: { min: 2, max: 10, integer: !0 },
                minorPerMajor: { min: 2, max: 5, integer: !0 },
                reading: { min: 0, max: 100, integer: !1 },
                zeroOffset: { min: -10, max: 10, integer: !1 },
                u: { choices: ['V', 'A', 'mA'] }
            },
            examples: [
                { labels: 'names', maximum: 5, majorDivisions: 5, minorPerMajor: 5, reading: 3.2, zeroOffset: 0, u: 'V' },
                { labels: 'names', maximum: 10, majorDivisions: 5, minorPerMajor: 5, reading: 6.4, zeroOffset: 0.2, u: 'A' }
            ],
            status: 'review-candidate',
            eligibility: 'board-tier-review-required'
        },
        'physics.magnet.straight_wire': {
            title: 'Magnetic field around a straight wire',
            subtopicIds: [102, 103],
            gap: 'STEM-12',
            kind: 'new-family',
            subject: 'Physics',
            relatedTemplates: ['physics.magnet.bar_field', 'physics.electromagnet.solenoid'],
            purpose: 'Bar magnet and solenoid do not encode straight-wire circular field and current direction.',
            adaptation: 'Current into/out of plane, selected compass positions, field arrow visibility.',
            limitation: 'Field geometry and direction only, not magnetic field strength. Dot is out of the page; cross is into the page.',
            acceptance:
                'Right-hand-rule direction and dot/cross conventions validated. No quantitative field strengths without a matching bounded model.',
            fields: {
                labels: { choices: ['names', 'letters', 'none'] },
                current: { choices: ['out', 'in'] },
                compasses: { min: 1, max: 4, integer: !0 },
                fieldArrows: { choices: ['show', 'hide'] }
            },
            examples: [
                { labels: 'names', current: 'out', compasses: 4, fieldArrows: 'show' },
                { labels: 'names', current: 'in', compasses: 2, fieldArrows: 'show' }
            ],
            status: 'review-candidate',
            eligibility: 'board-tier-review-required'
        },
        'physics.nuclear.absorption_setup': {
            title: 'Radiation absorption measurement setup',
            subtopicIds: [93],
            gap: 'STEM-13',
            kind: 'new-family',
            subject: 'Physics',
            relatedTemplates: ['physics.nuclear.radiation_penetration'],
            purpose: 'Penetration cartoon does not show source, absorber, detector and controlled separation.',
            adaptation: 'Source holder, absorber material/thickness, detector geometry, supplied counting interval and observations.',
            limitation:
                'Supplied counts and interval only; no fabricated measurement or inferred attenuation. Supervised apparatus context.',
            acceptance:
                'Keep geometry and background controls explicit; counts are supplied evidence, not fabricated measurements; supervised apparatus context.',
            fields: {
                labels: { choices: ['names', 'letters', 'none'] },
                absorber: { choices: ['paper', 'aluminium', 'lead', 'none'] },
                thicknessMm: { min: 0.1, max: 10, integer: !1 },
                separationCm: { min: 10, max: 40, integer: !1 },
                intervalSeconds: { min: 10, max: 120, integer: !0 },
                counts: { min: 0, max: 9999, integer: !0 },
                backgroundCounts: { min: 0, max: 999, integer: !0 },
                readout: { choices: ['hidden', 'given'] }
            },
            examples: [
                {
                    labels: 'names',
                    absorber: 'paper',
                    thicknessMm: 1,
                    separationCm: 20,
                    intervalSeconds: 60,
                    counts: 120,
                    backgroundCounts: 18,
                    readout: 'hidden'
                },
                {
                    labels: 'names',
                    absorber: 'lead',
                    thicknessMm: 5,
                    separationCm: 20,
                    intervalSeconds: 60,
                    counts: 120,
                    backgroundCounts: 18,
                    readout: 'given'
                }
            ],
            status: 'review-candidate',
            eligibility: 'board-tier-review-required'
        },
        'physics.thermal.radiation_comparison': {
            title: 'Thermal radiation comparison apparatus',
            subtopicIds: [91],
            gap: 'STEM-14',
            kind: 'new-family',
            subject: 'Physics',
            relatedTemplates: ['physics.thermal.conduction', 'physics.thermal.convection'],
            purpose: 'Conduction and convection drawings do not show a Leslie-cube or equivalent surface comparison.',
            adaptation: 'Approved surfaces, detector placement/distance and supplied temperatures.',
            limitation:
                'Two equal-size surface models at the same supplied temperature and detector distance. No detector results inferred.',
            acceptance:
                'Controlled distances and temperatures distinguish the intended comparison; no invented sensor readings. Confirm board/subtopic fit.',
            fields: {
                labels: { choices: ['names', 'letters', 'none'] },
                surfaceA: { choices: ['matt black', 'polished metal', 'matt white'] },
                surfaceB: { choices: ['polished metal', 'matt black', 'matt white'] },
                distanceCm: { min: 10, max: 40, integer: !1 },
                temperatureC: { min: 30, max: 90, integer: !1 }
            },
            examples: [
                { labels: 'names', surfaceA: 'matt black', surfaceB: 'polished metal', distanceCm: 20, temperatureC: 60 },
                { labels: 'names', surfaceA: 'matt black', surfaceB: 'matt white', distanceCm: 30, temperatureC: 60 }
            ],
            status: 'review-candidate',
            eligibility: 'board-tier-review-required'
        },
        'physics.gas.piston': {
            title: 'Gas pressure and piston apparatus',
            subtopicIds: [92],
            gap: 'STEM-15',
            kind: 'new-family',
            subject: 'Physics',
            relatedTemplates: ['chemistry.particle.states', 'physics.pressure.manometer'],
            purpose: 'Particle states and pressure differences do not show a variable-volume gas apparatus.',
            adaptation: 'Sealed piston/syringe, fixed particle number, volume, temperature assumption and pressure-gauge placement.',
            limitation:
                'Fixed gas quantity; pressure is absolute. Isothermal states must satisfy equal pV; other supplied states make no temperature claim.',
            acceptance:
                'Distinguish qualitative schematic from a numerical gas-law model; pressure/volume relation only under explicit conditions.',
            fields: {
                labels: { choices: ['names', 'letters', 'none'] },
                volumeA: { min: 20, max: 80, integer: !1 },
                volumeB: { min: 20, max: 80, integer: !1 },
                pressureA: { min: 20, max: 200, integer: !1 },
                pressureB: { min: 20, max: 400, integer: !1 },
                condition: { choices: ['isothermal', 'supplied-states'] },
                particles: { min: 6, max: 12, integer: !0 },
                pressureLabels: { choices: ['hidden', 'given'] }
            },
            examples: [
                {
                    labels: 'names',
                    volumeA: 60,
                    volumeB: 30,
                    pressureA: 100,
                    pressureB: 200,
                    condition: 'isothermal',
                    particles: 8,
                    pressureLabels: 'hidden'
                },
                {
                    labels: 'names',
                    volumeA: 40,
                    volumeB: 60,
                    pressureA: 150,
                    pressureB: 100,
                    condition: 'isothermal',
                    particles: 8,
                    pressureLabels: 'given'
                }
            ],
            status: 'review-candidate',
            eligibility: 'board-tier-review-required'
        },
        'physics.optics.fibre': {
            title: 'Optical-fibre internal reflection',
            subtopicIds: [100],
            gap: 'STEM-16',
            kind: 'new-family',
            subject: 'Physics',
            relatedTemplates: ['physics.optics.refraction'],
            purpose: 'Single-interface refraction does not supply a bounded multi-reflection path inside a fibre.',
            adaptation: 'Approved straight fibre geometry, indices, entry/propagation angle and selected rays.',
            limitation:
                'Straight fibre section; ray angle is inside the core relative to its axis. Entry refraction and bending losses are outside this model.',
            acceptance:
                'Check critical-angle conditions and actual intersections; out-of-scope boards use enrichment. Interactive ray exploration remains JSXGraph.',
            fields: {
                labels: { choices: ['names', 'letters', 'none'] },
                coreIndex: { min: 1.4, max: 1.8, integer: !1 },
                claddingIndex: { min: 1, max: 1.6, integer: !1 },
                rayAngle: { min: 10, max: 30, integer: !1 },
                rays: { choices: ['full', 'first-segment'] }
            },
            examples: [
                { labels: 'names', coreIndex: 1.5, claddingIndex: 1.3, rayAngle: 20, rays: 'full' },
                { labels: 'names', coreIndex: 1.6, claddingIndex: 1.2, rayAngle: 25, rays: 'full' }
            ],
            status: 'review-candidate',
            eligibility: 'board-tier-review-required'
        },
        'biology.organ.heart_detail': {
            title: 'Heart detail and circulation overview',
            subtopicIds: [41],
            gap: 'STEM-17',
            kind: 'detail-extension',
            subject: 'Biology',
            relatedTemplates: ['biology.organ.heart', 'biology.organ.heart_valve'],
            purpose: 'Existing labels are abbreviated and focus is circuit/valves only.',
            adaptation: 'Named vessels/chambers, selected valve state, oxygenation key, cross-section plus linked circulation inset.',
            limitation:
                'Simplified ventricular filling/ejection states, not a complete cardiac cycle. Anatomical right is the viewer\u2019s left.',
            acceptance:
                'Explicit viewing orientation; continuous blood paths; valve state must agree with any selected phase. More detail must not obscure the route.',
            fields: {
                labels: { choices: ['names', 'letters', 'none'] },
                phase: { choices: ['filling', 'ejection'] },
                focus: { choices: ['all', 'pulmonary', 'systemic'] },
                detail: { choices: ['section', 'circulation'] }
            },
            examples: [
                { labels: 'names', phase: 'filling', focus: 'all', detail: 'section' },
                { labels: 'names', phase: 'ejection', focus: 'all', detail: 'circulation' }
            ],
            status: 'review-candidate',
            eligibility: 'board-tier-review-required'
        },
        'biology.organ.eye_detail': {
            title: 'Eye accommodation and correction',
            subtopicIds: [50],
            gap: 'STEM-18',
            kind: 'detail-extension',
            subject: 'Biology',
            relatedTemplates: ['biology.organ.eye'],
            purpose: 'Near/distant lens selection lacks explicit ciliary muscles, ligaments and correction variants.',
            adaptation: 'Accommodation state, ciliary muscle/ligament detail, approved sight-defect and corrective-lens views.',
            limitation: 'Accommodation and sight-correction model is qualitative. Use the optics owner for quantitative ray construction.',
            acceptance:
                'Anatomical overview stays qualitative; quantitative rays use the existing optics model. No arbitrary focal-point placement.',
            fields: {
                labels: { choices: ['names', 'letters', 'none'] },
                viewState: { choices: ['near', 'distant', 'short-sighted', 'long-sighted'] },
                correction: { choices: ['none', 'shown'] }
            },
            examples: [
                { labels: 'names', viewState: 'near', correction: 'none' },
                { labels: 'names', viewState: 'short-sighted', correction: 'shown' }
            ],
            status: 'review-candidate',
            eligibility: 'board-tier-review-required'
        },
        'biology.exchange.surface_detail': {
            title: 'Exchange-surface magnified insets',
            subtopicIds: [40, 41],
            gap: 'STEM-19',
            kind: 'detail-extension',
            subject: 'Biology',
            relatedTemplates: ['biology.organ.alveolus', 'biology.organ.villus'],
            purpose: 'Overview views do not expose a shared close-up of the exchange barrier.',
            adaptation: 'Selected surface, epithelial layer, adjacent capillary, supplied gradient, direction/key, zoom inset.',
            limitation:
                'Different scales in overview/inset; no physical magnification. Arrows represent selected oxygen or glucose transfer only.',
            acceptance:
                'Distinguish air/intestinal content, tissue and blood; label scale changes; preserve diffusion distances and one-cell-thick claims correctly.',
            fields: {
                labels: { choices: ['names', 'letters', 'none'] },
                surface: { choices: ['alveolus', 'villus'] },
                viewState: { choices: ['overview', 'inset'] },
                transport: { choices: ['hidden', 'shown'] }
            },
            examples: [
                { labels: 'names', surface: 'alveolus', viewState: 'overview', transport: 'hidden' },
                { labels: 'names', surface: 'villus', viewState: 'inset', transport: 'shown' }
            ],
            status: 'review-candidate',
            eligibility: 'board-tier-review-required'
        },
        'biology.plant.pollination_comparison': {
            title: 'Wind- and insect-pollinated flowers',
            subtopicIds: [52, 53],
            gap: 'STEM-20',
            kind: 'detail-extension',
            subject: 'Biology',
            relatedTemplates: ['biology.plant.flower', 'biology.plant.pollen_tube'],
            purpose: 'Current flower only varies ovule/stamen counts.',
            adaptation: 'Two approved reproductive morphologies, stigma/anther positions and supplied pollen characteristics.',
            limitation:
                'Typical adaptations, not a named species or universal plant classification. Board/subtopic applicability must be reviewed.',
            acceptance:
                'Characteristics support a comparison without fabricating a named species; subtopic assignment needs board-specific confirmation.',
            fields: {
                labels: { choices: ['names', 'letters', 'none'] },
                viewState: { choices: ['comparison', 'wind', 'insect'] },
                pollen: { choices: ['shown', 'hidden'] }
            },
            examples: [
                { labels: 'names', viewState: 'comparison', pollen: 'shown' },
                { labels: 'letters', viewState: 'wind', pollen: 'shown' }
            ],
            status: 'review-candidate',
            eligibility: 'board-tier-review-required'
        },
        'chemistry.analysis.chromatography_multi': {
            title: 'Multi-lane chromatography',
            subtopicIds: [78],
            gap: 'STEM-21',
            kind: 'detail-extension',
            subject: 'Chemistry',
            relatedTemplates: ['chemistry.analysis.chromatography'],
            purpose: 'Existing template is two spots, insufficient for mixtures and reference standards.',
            adaptation: 'Bounded lanes with multiple authored spots, baseline/front, common scale and selected reference labels.',
            limitation: 'Explicit lane spot distances; -1 means absent. Shared baseline/front. Identity and Rf are never inferred.',
            acceptance: 'All spots inside valid front; common origin and distance scale; no inferred compound identity or Rf solution.',
            fields: {
                labels: { choices: ['names', 'letters', 'none'] },
                lanes: { min: 2, max: 4, integer: !0 },
                frontCm: { min: 4, max: 15, integer: !1 },
                dimensions: { choices: ['front-only', 'given', 'none'] },
                A1: { min: -1, max: 15, integer: !1 },
                A2: { min: -1, max: 15, integer: !1 },
                A3: { min: -1, max: 15, integer: !1 },
                B1: { min: -1, max: 15, integer: !1 },
                B2: { min: -1, max: 15, integer: !1 },
                B3: { min: -1, max: 15, integer: !1 },
                C1: { min: -1, max: 15, integer: !1 },
                C2: { min: -1, max: 15, integer: !1 },
                C3: { min: -1, max: 15, integer: !1 },
                D1: { min: -1, max: 15, integer: !1 },
                D2: { min: -1, max: 15, integer: !1 },
                D3: { min: -1, max: 15, integer: !1 }
            },
            examples: [
                {
                    labels: 'names',
                    lanes: 4,
                    frontCm: 8,
                    dimensions: 'front-only',
                    A1: 2,
                    A2: 4,
                    A3: 6,
                    B1: 2,
                    B2: -1,
                    B3: -1,
                    C1: 4,
                    C2: -1,
                    C3: -1,
                    D1: 6,
                    D2: -1,
                    D3: -1
                },
                {
                    labels: 'names',
                    lanes: 3,
                    frontCm: 8,
                    dimensions: 'front-only',
                    A1: 1,
                    A2: 3,
                    A3: 7,
                    B1: 3,
                    B2: -1,
                    B3: -1,
                    C1: 7,
                    C2: -1,
                    C3: -1,
                    D1: 6,
                    D2: -1,
                    D3: -1
                }
            ],
            status: 'review-candidate',
            eligibility: 'board-tier-review-required'
        },
        'chemistry.apparatus.electrolysis_specific': {
            title: 'Electrolysis with specified chemistry',
            subtopicIds: [71],
            gap: 'STEM-22',
            kind: 'detail-extension',
            subject: 'Chemistry',
            relatedTemplates: ['chemistry.apparatus.electrolysis', 'chemistry.electrolysis.voltameter'],
            purpose: 'Generic ion-pair/polarity template deliberately cannot determine products.',
            adaptation:
                'Allowlisted electrolyte/physical state, electrode material, collection vessels, explicit visible products or blanks.',
            limitation:
                'Only the selected reviewed electrolyte/state/electrode combination is supported. Brine means concentrated aqueous sodium chloride.',
            acceptance:
                'Independent charge/product reasoning for every supported case, atom accounting where shown, no extrapolation beyond reviewed cases.',
            fields: {
                labels: { choices: ['names', 'letters', 'none'] },
                case: { choices: ['copper-sulfate-carbon', 'copper-sulfate-copper', 'brine-carbon', 'molten-lead-bromide'] },
                cathodeSide: { choices: ['left', 'right'] },
                products: { choices: ['hidden', 'shown'] }
            },
            examples: [
                { labels: 'names', case: 'copper-sulfate-carbon', cathodeSide: 'left', products: 'hidden' },
                { labels: 'names', case: 'brine-carbon', cathodeSide: 'right', products: 'shown' }
            ],
            status: 'review-candidate',
            eligibility: 'board-tier-review-required'
        },
        'chemistry.apparatus.condenser_detail': {
            title: 'Distillation and reflux connection detail',
            subtopicIds: [78, 83, 318],
            gap: 'STEM-23',
            kind: 'detail-extension',
            subject: 'Chemistry',
            relatedTemplates: ['chemistry.apparatus.distillation', 'chemistry.apparatus.reflux'],
            purpose: 'Current temperature/volume inputs do not encode close-up connection or fault variants.',
            adaptation: 'Thermometer bulb, vapour path, condenser inner tube/water jacket, inlet/outlet and receiver view.',
            limitation:
                'Vapour and cooling water stay in separate passages; faulty flow allowed only in an explicit critique task. Not operating instructions.',
            acceptance:
                'Condenser flow/connectivity validated; deliberate faulty setups only in explicit authored critique tasks, never silently corrected.',
            fields: {
                labels: { choices: ['names', 'letters', 'none'] },
                mode: { choices: ['distillation', 'reflux'] },
                waterFlow: { choices: ['correct', 'reversed-critique'] },
                task: { choices: ['explain', 'critique'] },
                detail: { choices: ['whole', 'jacket'] }
            },
            examples: [
                { labels: 'names', mode: 'distillation', waterFlow: 'correct', task: 'explain', detail: 'whole' },
                { labels: 'names', mode: 'reflux', waterFlow: 'correct', task: 'explain', detail: 'jacket' }
            ],
            status: 'review-candidate',
            eligibility: 'board-tier-review-required'
        },
        'chemistry.measurement.gas_collection': {
            title: 'Gas-collection scale and zero handling',
            subtopicIds: [68, 74],
            gap: 'STEM-24',
            kind: 'detail-extension',
            subject: 'Chemistry',
            relatedTemplates: ['chemistry.apparatus.gas_syringe', 'chemistry.apparatus.water_displacement'],
            purpose: 'Apparatus exists; reusable fixed read-off mode needs explicit calibration.',
            adaptation: 'Instrument capacity, major/minor ticks, initial/final reading, plunger/meniscus and visible-givens selection.',
            limitation:
                'Two fixed views with shared calibration. Syringe reads plunger face; inverted cylinder reads gas-liquid boundary. Answers are not printed.',
            acceptance: 'Actual geometry reproduces values; fixed exam view cannot reset measurements or print assessed readings.',
            fields: {
                labels: { choices: ['names', 'letters', 'none'] },
                instrument: { choices: ['syringe', 'inverted-cylinder'] },
                capacityMl: { min: 20, max: 100, integer: !1 },
                initialMl: { min: 0, max: 100, integer: !1 },
                finalMl: { min: 0, max: 100, integer: !1 },
                majorDivisions: { min: 4, max: 10, integer: !0 }
            },
            examples: [
                { labels: 'names', instrument: 'syringe', capacityMl: 100, initialMl: 10, finalMl: 45, majorDivisions: 10 },
                { labels: 'names', instrument: 'inverted-cylinder', capacityMl: 50, initialMl: 5, finalMl: 22.5, majorDivisions: 10 }
            ],
            status: 'review-candidate',
            eligibility: 'board-tier-review-required'
        },
        'physics.circuit.practical': {
            title: 'Practical circuits and wire-resistance setup',
            subtopicIds: [88, 90],
            gap: 'STEM-25',
            kind: 'detail-extension',
            subject: 'Physics',
            relatedTemplates: ['physics.circuit.simple', 'physics.circuit.measurement', 'physics.circuit.potential_divider'],
            purpose: 'Current simple circuits allow lamp/resistor only; measurement placement is fixed.',
            adaptation:
                'Approved I\u2013V and wire-length topologies, diode/lamp/resistor, meters, variable resistor, wire/ruler/contact position.',
            limitation:
                'Approved circuit topology; wire diagram shows the selected length between fixed end and movable contact. No current/resistance answer inferred.',
            acceptance:
                'Bounded templates, not arbitrary LLM wiring; meter topology and electrical connections independently checked. Graphs remain Chart/JSXGraph.',
            fields: {
                labels: { choices: ['names', 'letters', 'none'] },
                setup: { choices: ['iv', 'wire'] },
                component: { choices: ['resistor', 'lamp', 'diode'] },
                supplyV: { min: 1, max: 12, integer: !1 },
                wireLengthCm: { min: 20, max: 100, integer: !1 },
                contactCm: { min: 5, max: 100, integer: !1 }
            },
            examples: [
                { labels: 'names', setup: 'iv', component: 'resistor', supplyV: 6, wireLengthCm: 80, contactCm: 50 },
                { labels: 'names', setup: 'wire', component: 'resistor', supplyV: 6, wireLengthCm: 80, contactCm: 50 }
            ],
            status: 'review-candidate',
            eligibility: 'board-tier-review-required'
        },
        'physics.electromagnetic.direction_detail': {
            title: 'Motor and generator directional detail',
            subtopicIds: [103, 104],
            gap: 'STEM-26',
            kind: 'detail-extension',
            subject: 'Physics',
            relatedTemplates: ['physics.motor.simple', 'physics.generator.alternator', 'physics.generator.dc_dynamo'],
            purpose: 'Simple motor contract explicitly omits force/rotation direction.',
            adaptation: 'Coil orientation, pole/current direction, force arrows and commutator/slip-ring state.',
            limitation:
                'Cross-section of opposite coil sides with a separate collector inset. Motor uses F=I\u2113\xD7B; generator polarity uses v\xD7B. Orientation is explicit.',
            acceptance: 'Directions derived from a consistent vector convention; current and rotation must not contradict one another.',
            fields: {
                labels: { choices: ['names', 'letters', 'none'] },
                mode: { choices: ['motor', 'generator'] },
                field: { choices: ['right', 'left'] },
                drive: { choices: ['out', 'in', 'up', 'down'] },
                collector: { choices: ['split-ring', 'slip-rings'] },
                coilAngle: { choices: ['0', '180'] },
                arrows: { choices: ['given', 'hidden'] }
            },
            examples: [
                { labels: 'names', mode: 'motor', field: 'right', drive: 'out', collector: 'split-ring', coilAngle: '0', arrows: 'given' },
                {
                    labels: 'names',
                    mode: 'generator',
                    field: 'right',
                    drive: 'up',
                    collector: 'slip-rings',
                    coilAngle: '0',
                    arrows: 'given'
                }
            ],
            status: 'review-candidate',
            eligibility: 'board-tier-review-required'
        },
        'physics.optics.partial_rays': {
            title: 'Part-completed ray constructions',
            subtopicIds: [100],
            gap: 'STEM-27',
            kind: 'detail-extension',
            subject: 'Physics',
            relatedTemplates: ['physics.optics.convex_lens', 'physics.optics.concave_lens', 'physics.optics.refraction'],
            purpose: 'Existing lens reader draws the completed image and rays.',
            adaptation: 'Fixed optical givens, selected visible rays, hidden solution rays/image and prescribed construction state.',
            limitation:
                'Same fixed lens/object coordinates in every construction state. Only complete view includes the image and solution rays.',
            acceptance:
                'Preserve all givens, do not expose withheld results in metadata. Persist learner construction separately through JSXGraph/assessment adapter.',
            fields: {
                labels: { choices: ['names', 'letters', 'none'] },
                lens: { choices: ['converging', 'diverging'] },
                focalCm: { min: 5, max: 20, integer: !1 },
                objectCm: { min: 5, max: 60, integer: !1 },
                heightCm: { min: 1, max: 5, integer: !1 },
                construction: { choices: ['givens', 'parallel-incident', 'two-incident', 'complete'] }
            },
            examples: [
                { labels: 'names', lens: 'converging', focalCm: 10, objectCm: 25, heightCm: 3, construction: 'givens' },
                { labels: 'names', lens: 'diverging', focalCm: 10, objectCm: 25, heightCm: 3, construction: 'two-incident' }
            ],
            status: 'review-candidate',
            eligibility: 'board-tier-review-required'
        },
        'physics.measurement.pressure_columns': {
            title: 'Calibrated manometer and barometer',
            subtopicIds: [92],
            gap: 'STEM-28',
            kind: 'detail-extension',
            subject: 'Physics',
            relatedTemplates: ['physics.pressure.manometer', 'physics.pressure.barometer'],
            purpose: 'Current drawings label supplied levels rather than exposing a reusable calibrated read-off contract.',
            adaptation:
                'Reference datum, scale window/divisions, fluid identity/density if used, two explicit levels and visible-givens policy.',
            limitation:
                'Levels are explicit positions on one upward scale. Barometer uses its supplied reservoir datum; no pressure answer is printed.',
            acceptance:
                'Independent vertical separation and pressure calculation; check consistent single scale. Not a new generic instrument renderer.',
            fields: {
                labels: { choices: ['names', 'letters', 'none'] },
                instrument: { choices: ['manometer', 'barometer'] },
                levelA: { min: 0, max: 100, integer: !1 },
                levelB: { min: 0, max: 100, integer: !1 },
                maximum: { min: 10, max: 100, integer: !1 },
                fluid: { choices: ['water', 'mercury'] },
                u: { choices: ['cm', 'mm'] }
            },
            examples: [
                { labels: 'names', instrument: 'manometer', levelA: 35, levelB: 65, maximum: 100, fluid: 'water', u: 'cm' },
                { labels: 'names', instrument: 'barometer', levelA: 0, levelB: 76, maximum: 100, fluid: 'mercury', u: 'cm' }
            ],
            status: 'review-candidate',
            eligibility: 'board-tier-review-required'
        },
        'math.area.compound_detail': {
            title: 'Compound-area decomposition',
            subtopicIds: [23],
            gap: 'STEM-29',
            kind: 'detail-extension',
            subject: 'Maths',
            relatedTemplates: ['math.area.compound_l', 'math.geometry.bisected_composite'],
            purpose: 'Existing bounded shapes do not cover a broader set of coherent cut-outs/joins.',
            adaptation:
                'Allowlisted composite outlines, explicit compatible dimensions, hidden length choice and optional construction line.',
            limitation:
                'Use supplied dimensions. Semicircle diameter equals rectangle height. Unknown complementary lengths and area remain unlabelled.',
            acceptance: 'Deterministic union/subtraction geometry and area; do not label an assessed length or infer missing constraints.',
            fields: {
                labels: { choices: ['names', 'letters', 'none'] },
                shape: { choices: ['corner-cut', 'semicircle-join', 'rectangular-hole'] },
                width: { min: 6, max: 20, integer: !1 },
                height: { min: 6, max: 16, integer: !1 },
                cutWidth: { min: 2, max: 8, integer: !1 },
                cutHeight: { min: 2, max: 6, integer: !1 },
                construction: { choices: ['none', 'shown'] },
                u: { choices: ['cm', 'm'] }
            },
            examples: [
                { labels: 'names', shape: 'corner-cut', width: 12, height: 10, cutWidth: 4, cutHeight: 3, construction: 'none', u: 'cm' },
                {
                    labels: 'names',
                    shape: 'semicircle-join',
                    width: 12,
                    height: 10,
                    cutWidth: 4,
                    cutHeight: 3,
                    construction: 'shown',
                    u: 'cm'
                }
            ],
            status: 'review-candidate',
            eligibility: 'board-tier-review-required'
        },
        'math.solid.linked_views': {
            title: 'Linked solid and orthographic views',
            subtopicIds: [23],
            gap: 'STEM-30',
            kind: 'detail-extension',
            subject: 'Maths',
            relatedTemplates: ['math.solid.orthographic', 'math.solid.isometric_cubes', 'math.solid.oblique_section'],
            purpose: 'Current types do not establish one shared geometry contract across their views.',
            adaptation: 'One bounded solid, front/side/plan views, viewing arrows, hidden edges and selected cross-section.',
            limitation:
                'One stepped-prism geometry drives all views. Missing views have no ghost solution. Orthographic panels share a common linear scale.',
            acceptance: 'All projections agree with the same source geometry; preserve exact dimensions and missing-view assessment state.',
            fields: {
                labels: { choices: ['names', 'letters', 'none'] },
                width: { min: 6, max: 12, integer: !1 },
                depth: { min: 3, max: 8, integer: !1 },
                height: { min: 6, max: 10, integer: !1 },
                stepWidth: { min: 2, max: 5, integer: !1 },
                lowHeight: { min: 2, max: 5, integer: !1 },
                missing: { choices: ['none', 'plan', 'side', 'front'] },
                section: { choices: ['none', 'mid-depth'] },
                u: { choices: ['cm', 'm'] }
            },
            examples: [
                { labels: 'names', width: 10, depth: 6, height: 8, stepWidth: 4, lowHeight: 3, missing: 'none', section: 'none', u: 'cm' },
                {
                    labels: 'names',
                    width: 10,
                    depth: 6,
                    height: 8,
                    stepWidth: 4,
                    lowHeight: 3,
                    missing: 'side',
                    section: 'mid-depth',
                    u: 'cm'
                }
            ],
            status: 'review-candidate',
            eligibility: 'board-tier-review-required'
        },
        'math.circle.theorem_givens': {
            title: 'Circle-theorem givens and unknowns',
            subtopicIds: [320, 24],
            gap: 'STEM-31',
            kind: 'detail-extension',
            subject: 'Maths',
            relatedTemplates: ['math.circle.cyclic_quadrilateral', 'math.circle.same_segment', 'math.circle.alternate_segment'],
            purpose: 'Angle variants do not give general authored selection of fixed labels and unknowns.',
            adaptation: 'Approved theorem topology, point labels, given angles, unknown markers and optional auxiliary lines.',
            limitation:
                'Reviewed circle topology with A/B/C/D points. Only the supplied angle is printed; solution angle is not included in metadata.',
            acceptance: 'Angles/topology consistent; marked givens survive hiding solution annotations. Reuse JSXGraph for exploration.',
            fields: {
                labels: { choices: ['names', 'letters', 'none'] },
                theorem: { choices: ['cyclic', 'same-segment', 'alternate-segment'] },
                givenAngle: { min: 35, max: 75, integer: !1 },
                construction: { choices: ['none', 'shown'] },
                unknown: { choices: ['marked', 'unmarked'] }
            },
            examples: [
                { labels: 'names', theorem: 'cyclic', givenAngle: 55, construction: 'none', unknown: 'marked' },
                { labels: 'names', theorem: 'alternate-segment', givenAngle: 60, construction: 'shown', unknown: 'marked' }
            ],
            status: 'review-candidate',
            eligibility: 'board-tier-review-required'
        },
        'math.bearing.route': {
            title: 'Multi-leg bearings',
            subtopicIds: [28, 29],
            gap: 'STEM-32',
            kind: 'detail-extension',
            subject: 'Maths',
            relatedTemplates: ['math.bearing.three_figure'],
            purpose: 'One bearing does not represent a route with different local north lines.',
            adaptation: 'Two or three legs, distances and bearings, local north references, selected angle givens.',
            limitation:
                'Route geometry follows clockwise bearings from local north. Display scaling is uniform but not a certified ruler-scale drawing.',
            acceptance:
                'Deterministic coordinate construction; distinguish schematic lengths from scale drawing; no auto-completed reverse bearing.',
            fields: {
                labels: { choices: ['names', 'letters', 'none'] },
                legs: { min: 2, max: 3, integer: !0 },
                bearingA: { min: 0, max: 359, integer: !1 },
                bearingB: { min: 0, max: 359, integer: !1 },
                bearingC: { min: 0, max: 359, integer: !1 },
                distanceA: { min: 2, max: 20, integer: !1 },
                distanceB: { min: 2, max: 20, integer: !1 },
                distanceC: { min: 2, max: 20, integer: !1 },
                givens: { choices: ['all', 'distances'] },
                u: { choices: ['km', 'm'] }
            },
            examples: [
                {
                    labels: 'names',
                    legs: 2,
                    bearingA: 60,
                    bearingB: 140,
                    bearingC: 240,
                    distanceA: 8,
                    distanceB: 6,
                    distanceC: 5,
                    givens: 'all',
                    u: 'km'
                },
                {
                    labels: 'names',
                    legs: 3,
                    bearingA: 45,
                    bearingB: 120,
                    bearingC: 210,
                    distanceA: 8,
                    distanceB: 6,
                    distanceC: 5,
                    givens: 'all',
                    u: 'km'
                }
            ],
            status: 'review-candidate',
            eligibility: 'board-tier-review-required'
        }
    }
    var d = (t, i) => Number(t[i])
    function Y(t) {
        let i = [[0, 0]]
        for (let e of ['A', 'B', 'C'].slice(0, d(t, 'legs'))) {
            let s = (d(t, 'bearing' + e) * Math.PI) / 180,
                a = d(t, 'distance' + e),
                r = i.at(-1)
            i.push([r[0] + a * Math.sin(s), r[1] - a * Math.cos(s)])
        }
        return i
    }
    function ee(t, i) {
        let e = (s, a) => {
            if (!s) throw new Error(a)
        }
        for (let s of Object.values(i))
            typeof s == 'number' && e(Math.abs(s * 100 - Math.round(s * 100)) < 1e-7, 'Measurements support at most two decimal places')
        if (t === 'physics.measurement.analogue_meter' || t === 'chemistry.measurement.gas_collection') {
            let s = d(i, t.startsWith('physics') ? 'maximum' : 'capacityMl') / d(i, 'majorDivisions')
            e(Math.abs(s * 10 - Math.round(s * 10)) < 1e-7, 'Choose a readable scale with whole or tenth-unit major intervals')
        }
        if (t === 'chemistry.analysis.chromatography_multi')
            for (let s of 'ABCD'.slice(0, d(i, 'lanes'))) {
                let a = [1, 2, 3]
                    .map((r) => d(i, s + r))
                    .filter((r) => r >= 0)
                    .sort((r, n) => r - n)
                e(
                    a.every((r, n) => n === 0 || r - a[n - 1] >= d(i, 'frontCm') * 0.08),
                    'Distinct spots must be separated enough to read; use one spot for unresolved substances'
                )
            }
        if (
            (t === 'chemistry.reaction.closed_equilibrium' &&
                e(
                    2 * Math.max(d(i, 'dimersBefore'), d(i, 'dimersAfter')) <= d(i, 'units'),
                    'Dimer populations exceed conserved atom count'
                ),
            t === 'physics.measurement.analogue_meter' &&
                e(
                    d(i, 'reading') <= d(i, 'maximum') && Math.abs(d(i, 'zeroOffset')) <= d(i, 'maximum') * 0.2,
                    'Reading or zero offset outside instrument range'
                ),
            t === 'physics.gas.piston' &&
                i.condition === 'isothermal' &&
                e(
                    Math.abs(d(i, 'volumeA') * d(i, 'pressureA') - d(i, 'volumeB') * d(i, 'pressureB')) < 1e-6,
                    'Isothermal fixed-quantity states must have equal pV'
                ),
            t === 'physics.optics.fibre' &&
                e(
                    d(i, 'coreIndex') > d(i, 'claddingIndex') &&
                        90 - d(i, 'rayAngle') > (Math.asin(d(i, 'claddingIndex') / d(i, 'coreIndex')) * 180) / Math.PI,
                    'Ray does not satisfy total internal reflection'
                ),
            t === 'biology.organ.eye_detail' &&
                e(
                    i.correction === 'none' || ['short-sighted', 'long-sighted'].includes(String(i.viewState)),
                    'Corrective lens requires an explicit sight-defect state'
                ),
            t === 'chemistry.analysis.chromatography_multi')
        )
            for (let s of 'ABCD')
                for (let a = 1; a <= 3; a++) {
                    let r = d(i, s + a)
                    e(r === -1 || (r >= 0 && r <= d(i, 'frontCm')), 'Spot must be absent (-1) or inside the solvent front')
                }
        if (
            (t === 'chemistry.apparatus.condenser_detail' &&
                e(
                    i.waterFlow === 'correct' || i.task === 'critique',
                    'Reversed cooling water is only supported for an authored critique task'
                ),
            t === 'chemistry.measurement.gas_collection' &&
                e(
                    d(i, 'initialMl') < d(i, 'finalMl') && d(i, 'finalMl') <= d(i, 'capacityMl'),
                    'Gas readings must increase within capacity'
                ),
            t === 'physics.circuit.practical' && e(d(i, 'contactCm') <= d(i, 'wireLengthCm'), 'Wire contact lies beyond wire length'),
            t === 'physics.electromagnetic.direction_detail' &&
                (e(
                    i.mode === 'motor' ? ['out', 'in'].includes(String(i.drive)) : ['up', 'down'].includes(String(i.drive)),
                    'Motor takes current direction; generator takes motion direction'
                ),
                e(i.mode !== 'motor' || i.collector === 'split-ring', 'This DC motor requires a split-ring commutator')),
            t === 'physics.optics.partial_rays')
        ) {
            let s = (i.lens === 'converging' ? 1 : -1) * d(i, 'focalCm'),
                a = d(i, 'objectCm'),
                r = (s * a) / (a - s)
            e(Math.abs(a - s) >= 2 && Math.abs(r) <= 100, 'Near-focus or unbounded image geometry is outside this reader')
        }
        if (
            (t === 'physics.measurement.pressure_columns' &&
                (e(Math.max(d(i, 'levelA'), d(i, 'levelB')) <= d(i, 'maximum'), 'Level exceeds calibrated scale'),
                i.instrument === 'manometer' &&
                    e(
                        Math.min(d(i, 'levelA'), d(i, 'levelB')) >= d(i, 'maximum') * 0.15 &&
                            Math.max(d(i, 'levelA'), d(i, 'levelB')) <= d(i, 'maximum') * 0.9,
                        'Manometer levels must remain inside its straight limbs'
                    ),
                i.instrument === 'barometer' &&
                    e(d(i, 'levelA') === 0 && d(i, 'levelB') > 0, 'Barometer reservoir datum must be zero and column positive')),
            t === 'math.bearing.route')
        ) {
            let s = Y(i),
                a = s.map((l) => l[0]),
                r = s.map((l) => l[1]),
                n = Math.min(470 / Math.max(1, Math.max(...a) - Math.min(...a)), 190 / Math.max(1, Math.max(...r) - Math.min(...r))),
                o = s.flatMap(([l, c], p) => [[l * n - 16, c * n + 20], ...(p < s.length - 1 ? [[l * n, c * n - 65]] : [])])
            e(
                s.every((l, c) => s.slice(c + 1).every((p) => Math.hypot(l[0] - p[0], l[1] - p[1]) * n >= 50)),
                'Route vertices overlap at this figure scale'
            ),
                e(
                    o.every((l, c) => o.slice(c + 1).every((p) => Math.abs(l[0] - p[0]) >= 28 || Math.abs(l[1] - p[1]) >= 22)),
                    'Route callouts overlap; use another layout or the coordinate renderer'
                )
        }
        t === 'math.area.compound_detail' &&
            e(
                d(i, 'cutWidth') < d(i, 'width') && d(i, 'cutHeight') < d(i, 'height'),
                'Cut-out must fit strictly inside outline dimensions'
            ),
            t === 'math.solid.linked_views' &&
                e(
                    d(i, 'stepWidth') < d(i, 'width') && d(i, 'lowHeight') < d(i, 'height'),
                    'Stepped solid requires smaller step width and lower height'
                )
    }
    var I = '0.1.0',
        m = (t, i, e = !1) => ({ min: t, max: i, integer: e }),
        b = (...t) => ({ choices: t }),
        Ie = {
            'physics.measurement.oscilloscope_calibrated': {
                title: 'Calibrated oscilloscope',
                subtopicIds: [99],
                gap: 'V04',
                fields: {
                    horizontalDivisions: m(8, 12, !0),
                    verticalDivisions: m(6, 10, !0),
                    secondsPerDivision: m(1e-6, 1),
                    voltsPerDivision: m(0.001, 100),
                    periodDivisions: m(2, 6),
                    amplitudeDivisions: m(0.5, 3),
                    zeroDivision: m(1, 9),
                    phaseDegrees: m(0, 359),
                    offsetDivisions: m(-2, 2)
                },
                examples: [
                    {
                        horizontalDivisions: 10,
                        verticalDivisions: 8,
                        secondsPerDivision: 0.002,
                        voltsPerDivision: 2,
                        periodDivisions: 4,
                        amplitudeDivisions: 2,
                        zeroDivision: 4,
                        phaseDegrees: 0,
                        offsetDivisions: 0
                    },
                    {
                        horizontalDivisions: 12,
                        verticalDivisions: 8,
                        secondsPerDivision: 5e-4,
                        voltsPerDivision: 0.5,
                        periodDivisions: 3,
                        amplitudeDivisions: 1.5,
                        zeroDivision: 4,
                        phaseDegrees: 90,
                        offsetDivisions: 0.5
                    }
                ]
            },
            'math.net.triangular_prism_general': {
                title: 'Triangular-prism net',
                subtopicIds: [23],
                gap: 'V05',
                fields: {
                    base: m(1, 30),
                    left: m(1, 30),
                    right: m(1, 30),
                    length: m(1, 40),
                    u: b('mm', 'cm', 'm'),
                    dimensions: b('all', 'none')
                },
                examples: [
                    { base: 5, left: 3, right: 4, length: 8, u: 'cm', dimensions: 'all' },
                    { base: 7, left: 5, right: 6, length: 9, u: 'cm', dimensions: 'all' }
                ]
            },
            'chemistry.measurement.burette_pair': {
                title: 'Initial and final burette readings',
                subtopicIds: [319],
                gap: 'V06',
                fields: {
                    initialMl: { min: 0, max: 50, step: 0.05 },
                    finalMl: { min: 0, max: 50, step: 0.05 },
                    initialWindowMl: m(0, 47, !0),
                    finalWindowMl: m(0, 47, !0),
                    meniscus: b('concave'),
                    readPoint: b('bottom'),
                    u: b('mL')
                },
                examples: [
                    {
                        initialMl: 1.25,
                        finalMl: 24.6,
                        initialWindowMl: 0,
                        finalWindowMl: 23,
                        meniscus: 'concave',
                        readPoint: 'bottom',
                        u: 'mL'
                    },
                    {
                        initialMl: 3.5,
                        finalMl: 28.15,
                        initialWindowMl: 2,
                        finalWindowMl: 27,
                        meniscus: 'concave',
                        readPoint: 'bottom',
                        u: 'mL'
                    }
                ]
            },
            'physics.investigation.parachute_comparison': {
                title: 'Parachute investigation',
                subtopicIds: [95, 96],
                gap: 'V17',
                fields: Object.fromEntries(
                    ['A', 'B', 'C', 'D']
                        .flatMap((t) => [
                            [`shape${t}`, b('circle', 'square', 'hexagon')],
                            [`area${t}`, m(10, 80)],
                            [`load${t}`, m(1, 16)],
                            [`cord${t}`, m(15, 30)]
                        ])
                        .concat([['dimensions', b('all', 'none')]])
                ),
                examples: [
                    {
                        shapeA: 'circle',
                        areaA: 15,
                        loadA: 2,
                        cordA: 20,
                        shapeB: 'square',
                        areaB: 25,
                        loadB: 6,
                        cordB: 25,
                        shapeC: 'hexagon',
                        areaC: 35,
                        loadC: 3,
                        cordC: 25,
                        shapeD: 'circle',
                        areaD: 55,
                        loadD: 4,
                        cordD: 20,
                        dimensions: 'all'
                    },
                    {
                        shapeA: 'circle',
                        areaA: 20,
                        loadA: 3,
                        cordA: 22,
                        shapeB: 'circle',
                        areaB: 35,
                        loadB: 3,
                        cordB: 22,
                        shapeC: 'circle',
                        areaC: 50,
                        loadC: 3,
                        cordC: 22,
                        shapeD: 'circle',
                        areaD: 70,
                        loadD: 3,
                        cordD: 22,
                        dimensions: 'all'
                    }
                ]
            },
            'biology.nervous.octopus': {
                title: 'Octopus nervous system',
                subtopicIds: [50],
                gap: 'V17',
                fields: { labels: b('names', 'letters', 'none'), highlight: b('none', 'brain', 'arm-cords') },
                examples: [
                    { labels: 'names', highlight: 'none' },
                    { labels: 'letters', highlight: 'arm-cords' }
                ]
            },
            'physics.energy.transfer_split': {
                title: 'Energy-transfer diagram',
                subtopicIds: [85, 87],
                gap: 'V07',
                fields: {
                    inputJ: m(1, 1e6),
                    usefulJ: m(1, 1e6),
                    dissipatedJ: m(1, 1e6),
                    values: b('all', 'input-useful', 'input-dissipated', 'none'),
                    u: b('J', 'kJ')
                },
                examples: [
                    { inputJ: 100, usefulJ: 60, dissipatedJ: 40, values: 'input-useful', u: 'J' },
                    { inputJ: 250, usefulJ: 100, dissipatedJ: 150, values: 'all', u: 'J' }
                ]
            }
        },
        te = X,
        P = { ...Ie, ...te }
    function ie(t) {
        if ((L(t), new TextEncoder().encode(JSON.stringify(t)).length > 12e3)) throw new Error('Figure descriptor too large')
        if (!t || typeof t != 'object' || Array.isArray(t)) throw new Error('Expected descriptor')
        let i = t
        if (Object.keys(i).sort().join(',') !== 'p,t,v,view' || i.v !== 1 || i.view !== 'fixed' || typeof i.t != 'string')
            throw new Error('Invalid fixed-figure descriptor')
        let [e, s, a] = i.t.split('@')
        if (s !== I || a || !Object.hasOwn(P, e)) throw new Error('Unsupported figure version')
        if (!i.p || typeof i.p != 'object' || Array.isArray(i.p)) throw new Error('Expected parameters')
        let r = i.p,
            n = P[e].fields
        if (Object.keys(r).sort().join(',') !== Object.keys(n).sort().join(',')) throw new Error('Supply exactly the declared parameters')
        for (let [l, c] of Object.entries(n)) {
            let p = r[l]
            if ('choices' in c) {
                if (typeof p != 'string' || !c.choices.includes(p)) throw new Error(`Invalid ${l}`)
            } else if (
                typeof p != 'number' ||
                p < c.min ||
                p > c.max ||
                (c.integer && !Number.isInteger(p)) ||
                (c.step && Math.abs(p / c.step - Math.round(p / c.step)) > 1e-7)
            )
                throw new Error(`Invalid ${l}`)
        }
        let o = (l) => Number(r[l])
        if (e === 'physics.measurement.oscilloscope_calibrated') {
            let l = o('zeroDivision') - o('offsetDivisions'),
                c = o('amplitudeDivisions'),
                p = o('verticalDivisions')
            if (o('zeroDivision') >= p || l - c < 0.25 || l + c > p - 0.25) throw new Error('Waveform must fit the calibrated screen')
        }
        if (e === 'math.net.triangular_prism_general') {
            let l = o('base'),
                c = o('left'),
                p = o('right'),
                f = (l * l + c * c - p * p) / (2 * l),
                C = Math.sqrt(c * c - f * f)
            if (l < Math.max(c, p) || c + p <= l || !Number.isFinite(C) || C / l < 0.15 || o('length') / l < 0.25 || o('length') / l > 4)
                throw new Error('Unsupported triangle or unreadable net proportions')
        }
        if (e === 'chemistry.measurement.burette_pair') {
            for (let l of ['initial', 'final'])
                if (o(`${l}Ml`) < o(`${l}WindowMl`) + 0.2 || o(`${l}Ml`) > o(`${l}WindowMl`) + 2.8)
                    throw new Error('Meniscus must lie inside the supplied scale window')
            if (o('finalMl') <= o('initialMl'))
                throw new Error('Final reading must exceed initial reading for a single unreplenished burette')
        }
        if (e === 'physics.energy.transfer_split') {
            let l = o('inputJ'),
                c = o('usefulJ'),
                p = o('dissipatedJ')
            if (Math.abs(l - c - p) > 1e-9 * Math.max(1, l) || c / l < 0.1 || c / l > 0.9)
                throw new Error('Energy must balance; each branch must be at least ten percent')
        }
        return Object.hasOwn(te, e) && ee(e, r), { v: 1, t: i.t, p: { ...r }, view: 'fixed' }
    }
    var ae = Object.freeze(Object.keys(P)),
        se = (t) => Object.hasOwn(P, t)
    function ne(t, i, e) {
        if (!['labelled', 'hint', 'blank'].includes(String(e))) throw new Error('Invalid diagram variant')
        let s = ie({ v: 1, t: `${t}@${I}`, p: i, view: 'fixed' })
        return { schemaVersion: 1, templateId: t, templateVersion: '1.0.0', parameters: s.p, variant: e }
    }
    var G = {
        'math.area.annulus': {
            title: 'Annulus',
            fields: { outerRadius: [0.1, 1e3, 8], innerRadius: [0.1, 1e3, 4] },
            units: !0,
            description: 'Two concentric circles with the ring shaded; outer and inner radii are marked.',
            limitation: 'Concentric-circle model. Given radii determine area; the numerical answer is withheld.',
            adaptation: 'Explicit question quantities adjust this bounded diagram; structure remains schematic where stated.'
        },
        'math.area.compound_l': {
            title: 'L-shaped compound area',
            fields: { width: [0.1, 1e3, 12], height: [0.1, 1e3, 10], cutWidth: [0.1, 1e3, 6], cutHeight: [0.1, 1e3, 6] },
            units: !0,
            description: 'An L-shaped region with overall width and height and a rectangular missing corner.',
            limitation: 'One rectangular cut-out. Construction is schematic; use the supplied dimensions.',
            adaptation: 'Explicit question quantities adjust this bounded diagram; structure remains schematic where stated.'
        },
        'math.area.kite': {
            title: 'Kite diagonals',
            fields: { horizontal: [0.1, 1e3, 8], vertical: [0.1, 1e3, 12] },
            units: !0,
            description: 'A kite with perpendicular diagonals and a right-angle marker at their intersection.',
            limitation: 'The diagonals determine the area but not a unique kite. Schematic outline.',
            adaptation: 'Explicit question quantities adjust this bounded diagram; structure remains schematic where stated.'
        },
        'math.volume.cone': {
            title: 'Cone',
            fields: { radius: [0.1, 1e3, 4], height: [0.1, 1e3, 9] },
            units: !0,
            description: 'A cone with its perpendicular height from apex to centre of the circular base and a base radius.',
            limitation: 'The dashed line is perpendicular height, not slant height. Schematic perspective.',
            adaptation: 'Explicit question quantities adjust this bounded diagram; structure remains schematic where stated.'
        },
        'math.volume.sphere': {
            title: 'Sphere',
            fields: { radius: [0.1, 1e3, 6] },
            units: !0,
            description: 'A sphere with a radius drawn from its centre and an equatorial ellipse indicating depth.',
            limitation: 'The ellipse is a perspective aid, not a second measured cross-section.',
            adaptation: 'Explicit question quantities adjust this bounded diagram; structure remains schematic where stated.'
        },
        'math.volume.triangular_prism': {
            title: 'Triangular prism',
            fields: { base: [0.1, 1e3, 6], height: [0.1, 1e3, 4], length: [0.1, 1e3, 12] },
            units: !0,
            description: 'A right-triangular prism with cross-section base, perpendicular height and extrusion length.',
            limitation: 'This preview supports a right-triangular cross-section. Schematic perspective.',
            adaptation: 'Explicit question quantities adjust this bounded diagram; structure remains schematic where stated.'
        },
        'math.net.cuboid': {
            title: 'Cuboid net',
            fields: { length: [0.1, 1e3, 6], width: [0.1, 1e3, 3], height: [0.1, 1e3, 4] },
            units: !0,
            description: 'Six rectangles arranged in a valid cuboid net with matching shared edge lengths.',
            limitation: 'Face geometry is generated from the three given dimensions; no glue tabs are included.',
            adaptation: 'Explicit question quantities adjust this bounded diagram; structure remains schematic where stated.'
        },
        'math.construction.perpendicular_bisector': {
            title: 'Perpendicular bisector',
            fields: { length: [0.1, 1e3, 8], compassRadius: [0.1, 1e3, 6] },
            description:
                'A perpendicular bisector. Geometry is constructed within this template\u2019s approved boundaries; visible labels and supplied values are listed with the diagram.',
            limitation:
                'Bounded teaching template. Givens are supplied explicitly; perspective views are schematic. No calculated answer or assessment evidence is emitted.',
            units: !0,
            adaptation:
                'Question-supplied semantic parameters drive the dimensions, geometric construction or discrete model. No model-authored SVG coordinates.',
            labels: { pointA: { match: 'A', example: 'A', maxLength: 3 }, pointB: { match: 'B', example: 'B', maxLength: 3 } }
        },
        'math.circle.tangent_radius': {
            title: 'Radius meets tangent',
            fields: { radius: [0.1, 1e3, 6] },
            description: 'A radius meets tangent. Its bounded geometry and question values are supplied explicitly.',
            limitation: 'Bounded teaching schematic. No calculated answer is printed. Perspective drawings are not to scale.',
            adaptation: 'Question parameters adjust the construction or dimensions. Model-supplied SVG coordinates are not accepted.',
            units: !0,
            labels: { pointO: { match: 'O', example: 'O', maxLength: 3 }, pointT: { match: 'T', example: 'T', maxLength: 3 } }
        },
        'math.angle.parallel_transversal': {
            title: 'Parallel lines and transversal',
            fields: { angle: [45, 75, 55] },
            description: 'Two marked parallel lines crossed by a transversal. A given angle and a corresponding unknown angle are marked.',
            limitation: 'Corresponding angles on parallel lines. The unknown angle value is not printed.',
            adaptation: 'Explicit question quantities adjust this bounded diagram; structure remains schematic where stated.'
        },
        'physics.wave.longitudinal': {
            title: 'Longitudinal wave',
            fields: { wavelength: [0.1, 10, 2], periods: [2, 4, 3], compression: [0.2, 0.8, 0.6] },
            description:
                'Particle positions show repeating compressions and rarefactions. Oscillation is parallel to travel and adjacent compressions are one wavelength apart.',
            limitation: 'One-dimensional particle model; strokes are particles, not transverse displacement.',
            adaptation: 'Compression, rarefaction and parallel oscillation. Use explicit question data and supported structural choices.',
            createdBatch: 'physics-completion',
            fieldDescriptions: {
                wavelength: 'metres',
                periods: 'An explicit bounded question quantity or approved choice.',
                compression: 'dimensionless density modulation, not particle speed'
            }
        },
        'physics.optics.refraction': {
            title: 'Refraction at a boundary',
            fields: { incidence: [0, 75, 45], n1: [1, 2.5, 1], n2: [1, 2.5, 1.5] },
            description:
                'A ray crosses a boundary between two specified refractive indices. The transmitted angle is derived from Snell\u2019s law; the normal is shown.',
            limitation: 'Bounded teaching schematic. Explicit givens are shown without a calculated answer or new assessment evidence.',
            adaptation: 'Normal, two media and Snell calculation. Use explicit question data and supported structural choices.',
            createdBatch: 'physics-completion',
            fieldDescriptions: {
                incidence: 'degrees to normal',
                n1: 'incident-medium refractive index',
                n2: 'transmitted-medium refractive index'
            }
        },
        'physics.moment.lever': {
            title: 'Lever and pivot',
            fields: { leftForce: [1, 1e3, 20], rightForce: [1, 1e3, 30], leftDistance: [0.1, 10, 2], rightDistance: [0.1, 10, 1.5] },
            description:
                'Two downward forces act on opposite sides of a pivot, with explicit perpendicular distances. No claim of equilibrium is added.',
            limitation: 'Bounded teaching schematic. Explicit givens are shown without a calculated answer or new assessment evidence.',
            adaptation: 'Perpendicular force distances; no asserted balance. Use explicit question data and supported structural choices.',
            createdBatch: 'physics-completion',
            fieldDescriptions: {
                leftForce: 'N downward',
                rightForce: 'N downward',
                leftDistance: 'metres perpendicular to force',
                rightDistance: 'metres perpendicular to force'
            }
        },
        'physics.magnet.bar_field': {
            title: 'Bar magnet field',
            fields: { northEnd: [-1, 1, -1], showCompass: [0, 1, 1] },
            description:
                'A bar magnet has the supplied north-end orientation. External field arrows go from north to south; an optional compass follows the local field.',
            limitation: 'Bounded teaching schematic. Explicit givens are shown without a calculated answer or new assessment evidence.',
            adaptation: 'External field arrows north to south. Use explicit question data and supported structural choices.',
            createdBatch: 'physics-completion',
            fieldDescriptions: { northEnd: '-1: left; 1: right', showCompass: 'An explicit bounded question quantity or approved choice.' }
        },
        'chemistry.apparatus.filtration': {
            title: 'Filtration apparatus',
            fields: { residueParticles: [1, 8, 5], filtrateMl: [1, 500, 50] },
            description: 'Insoluble residue stays on the filter paper; liquid passes into the receiver.',
            limitation: 'Particle marks are schematic and do not imply a measured residue mass.',
            adaptation:
                'Filter paper, residue and collected filtrate. Use supplied question data and the declared structural choices; do not invent absent givens.',
            createdBatch: 'chemistry-completion',
            fieldDescriptions: { residueParticles: 'residueParticles', filtrateMl: 'filtrate in mL' },
            labels: {
                residueLabel: { match: 'Residue', example: 'Sand', maxLength: 16 },
                filtrateLabel: { match: 'Filtrate', example: 'Salt solution', maxLength: 18 }
            }
        },
        'chemistry.apparatus.distillation': {
            title: 'Simple distillation apparatus',
            fields: { vapourC: [20, 150, 100], distillateMl: [1, 500, 25] },
            description: 'A vapour path leads from a heated flask through a sloping water-cooled condenser to an open receiver.',
            limitation: 'Schematic apparatus, not operating instructions. The supplied vapour reading does not determine purity.',
            adaptation:
                'Thermometer position, condenser and open receiver. Use supplied question data and the declared structural choices; do not invent absent givens.',
            createdBatch: 'chemistry-completion',
            fieldDescriptions: { vapourC: 'vapour in \xB0C', distillateMl: 'distillate in mL' },
            labels: {
                mixtureLabel: { match: 'Mixture', example: 'Salt solution', maxLength: 18 },
                distillateLabel: { match: 'Distillate', example: 'Water', maxLength: 18 }
            }
        },
        'chemistry.analysis.chromatography': {
            title: 'Paper chromatography setup',
            fields: { frontCm: [1, 20, 8], spotACm: [0, 20, 3], spotBCm: [0, 20, 6] },
            description: 'Two sample spots lie between a pencil baseline above the solvent and the solvent front.',
            limitation: 'Spot distances are supplied measurements. No substance identity or Rf answer is inferred.',
            adaptation:
                'Pencil baseline above solvent and bounded spots. Use supplied question data and the declared structural choices; do not invent absent givens.',
            createdBatch: 'chemistry-completion',
            fieldDescriptions: { frontCm: 'front in cm', spotACm: 'spotA in cm', spotBCm: 'spotB in cm' },
            labels: {
                sampleA: { match: 'Sample A', example: 'A', maxLength: 4 },
                sampleB: { match: 'Sample B', example: 'B', maxLength: 4 }
            }
        },
        'chemistry.bonding.metallic': {
            title: 'Metallic lattice model',
            fields: { columns: [3, 5, 4], metal: [0, 3, 0], showDrift: [0, 1, 0] },
            description:
                'Positive metal ions occupy fixed positions with delocalised electrons; optional drift indicates an applied field.',
            limitation:
                'A two-dimensional model. Generic metal uses qualitative singly-positive centres; named sodium, magnesium and aluminium use one, two and three delocalised electrons per ion.',
            adaptation:
                'Positive ions and delocalised electrons. Use supplied question data and the declared structural choices; do not invent absent givens.',
            createdBatch: 'chemistry-completion',
            fieldDescriptions: {
                columns: 'columns',
                metal: '0 generic metal model; 1 sodium; 2 magnesium; 3 aluminium',
                showDrift: 'showDrift'
            }
        },
        'biology.plant.leaf_section': {
            title: 'Leaf cross-section',
            fields: { palisadeRows: [1, 2, 1], focusLayer: [1, 5, 2] },
            description:
                'A dicot leaf section shows cuticle, upper epidermis, palisade and spongy mesophyll, a vascular bundle and a lower stoma.',
            limitation: 'Representative dicot anatomy; tissue thickness and cell numbers are schematic, not universal.',
            adaptation:
                'Upper/lower epidermis, mesophyll and vascular bundle. Select approved structures and use supplied observations only; do not invent absent measurements.',
            createdBatch: 'biology-completion',
            fieldDescriptions: { palisadeRows: 'palisadeRows', focusLayer: '1 cuticle; 2 palisade; 3 spongy mesophyll; 4 vein; 5 stoma.' }
        },
        'biology.organ.villus': {
            title: 'Intestinal villus',
            fields: { focusPart: [1, 3, 1], heightMm: [0.2, 2, 1] },
            description: 'A villus has a thin epithelium, blood-capillary loop and central lacteal, with a supplied height.',
            limitation:
                'Selected small-intestine structures. Nutrient-specific uptake is explained in accompanying text; no absorption rate is inferred.',
            adaptation:
                'Thin epithelium, capillary network and lacteal. Select approved structures and use supplied observations only; do not invent absent measurements.',
            createdBatch: 'biology-completion',
            fieldDescriptions: { focusPart: '1 epithelium; 2 capillary; 3 lacteal.', heightMm: 'heightMm' }
        },
        'biology.organ.alveolus': {
            title: 'Alveolus and capillary',
            fields: { focusPart: [1, 2, 1], barrierUm: [0.1, 2, 0.5] },
            description: 'An alveolar air space borders a capillary; oxygen diffuses to blood and carbon dioxide to alveolar air.',
            limitation: 'Healthy gas-exchange model. Supplied barrier thickness does not determine a rate without further data.',
            adaptation:
                'Thin walls and gas exchange directions. Select approved structures and use supplied observations only; do not invent absent measurements.',
            createdBatch: 'biology-completion',
            fieldDescriptions: {
                focusPart: '1 thin exchange surface; 2 capillary.',
                barrierUm: 'Given air-to-blood barrier thickness in micrometres.'
            }
        },
        'biology.plant.stomata': {
            title: 'Stomatal apparatus',
            fields: { open: [0, 1, 1], chloroplastMarks: [3, 5, 4] },
            description: 'A surface view shows paired guard cells surrounding an open pore or meeting at a closed pore.',
            limitation: 'Qualitative aperture only. Chloroplast marks are selected organelles, not an actual count.',
            adaptation:
                'Guard cells and pore; surface view. Select approved structures and use supplied observations only; do not invent absent measurements.',
            createdBatch: 'biology-completion',
            fieldDescriptions: { open: 'open', chloroplastMarks: 'chloroplastMarks' }
        },
        'geography.tectonic.subduction': {
            title: 'Subduction cross-section',
            fields: { dipDegrees: [25, 60, 40] },
            description: 'An oceanic slab dips beneath a continental plate; the trench, volcanic arc and mantle are distinguished.',
            limitation:
                'Simplified oceanic\u2013continental convergence. Water released from the slab promotes melting above it; this is not a claim that the slab simply melts by friction.',
            adaptation:
                'Oceanic plate descends; slab, trench and volcanic arc. Use supplied observations and approved model choices only. This schematic is not evidence of a real location.',
            createdBatch: 'geography-completion',
            fieldDescriptions: { dipDegrees: 'Supplied slab dip in degrees below horizontal.' }
        },
        'geography.river.meander': {
            title: 'Meander plan and bank features',
            fields: { bendStrength: [1, 3, 2], widthM: [2, 100, 20] },
            description:
                'A plan-view meander places erosion on the outside of each bend and deposition on the inside, with downstream arrows.',
            limitation:
                'bendStrength is an approved qualitative drawing choice, not a measured curvature. Supplied width does not define a unique channel plan.',
            adaptation:
                'Outer-bank erosion and inner-bank deposition. Use supplied observations and approved model choices only. This schematic is not evidence of a real location.',
            createdBatch: 'geography-completion',
            fieldDescriptions: {
                bendStrength: '1 gentler; 2 moderate; 3 pronounced bend. Approved shapes, not physical curvature measurements.',
                widthM: 'Given channel width in metres.'
            }
        },
        'geography.river.waterfall': {
            title: 'Waterfall cross-section',
            fields: { undercutM: [1, 12, 5] },
            description: 'A resistant cap rock overlies less resistant rock; an undercut and plunge pool accompany upstream retreat.',
            limitation: 'A selected differential-erosion model, not a history reconstructed from one undercut measurement.',
            adaptation:
                'Resistant cap rock, undercutting and plunge pool. Use supplied observations and approved model choices only. This schematic is not evidence of a real location.',
            createdBatch: 'geography-completion',
            fieldDescriptions: { undercutM: 'undercutM' }
        },
        'geography.coast.spit': {
            title: 'Spit and longshore drift',
            fields: { extensionM: [100, 900, 500] },
            description:
                'Oblique swash and downslope backwash accompany sediment transport towards an attached, recurved spit and sheltered water.',
            limitation: 'Generic plan geometry. Given extension does not determine sediment budget or the history of a real coastline.',
            adaptation:
                'Oblique swash, shore-normal backwash and sheltered water. Use supplied observations and approved model choices only. This schematic is not evidence of a real location.',
            createdBatch: 'geography-completion',
            fieldDescriptions: { extensionM: 'extensionM' }
        },
        'history.norman.motte_bailey': {
            title: 'Motte-and-bailey castle',
            fields: { baileyBuildings: [2, 6, 3] },
            description: 'A timber keep stands on a mound beside an enclosed bailey; a bridge connects the raised keep to the courtyard.',
            limitation:
                'Late-11th-century English castle model. Buildings, terrain and outline are selected for explanation; named castle evidence requires its own plan. Original teaching reconstruction, not an authentic historical source.',
            adaptation:
                'Generic reconstruction; mound, keep, bailey and ditch. Choose this only for structural or spatial explanation. Use supplied question intent to select the approved feature or model extent. Counts are illustrative unless separately evidenced; never infer site, date, capacity or event details. Use verified images for authentic source analysis and Mermaid/learning_visual for causal relationships.',
            createdBatch: 'history-completion',
            fieldDescriptions: { baileyBuildings: 'Number of buildings included in the illustrative bailey, not a historical count.' }
        },
        'history.medieval.monastery': {
            title: 'Monastery layout',
            fields: { garden: [0, 1, 0] },
            description: 'A generic cloister has a church, west and east ranges and a refectory, with an optional adjacent garden.',
            limitation:
                'Selected medieval communal-monastery arrangement; monastic orders and individual sites differed. Original teaching reconstruction, not an authentic historical source.',
            adaptation:
                'Generic cloister and adjacent buildings; no claimed site plan. Choose this only for structural or spatial explanation. Use supplied question intent to select the approved feature or model extent. Counts are illustrative unless separately evidenced; never infer site, date, capacity or event details. Use verified images for authentic source analysis and Mermaid/learning_visual for causal relationships.',
            createdBatch: 'history-completion',
            fieldDescriptions: { garden: '0 cloister ranges only; 1 include an adjacent garden plot.' }
        },
        'english.language.sentence_spans': {
            title: 'Sentence annotation plate',
            fields: { start: [0, 149, 4], end: [1, 150, 12] },
            description: 'An exact supplied sentence is underlined at a validated character span, with a supplied annotation below.',
            limitation: 'The annotation is authored data, not a grammar judgement by the renderer.',
            adaptation:
                'Authored sentence and explicit token spans; supplied-text adapter planned. Use exact supplied text or approved original scene choices for this learning purpose. Preserve learner authorship. This is a teaching illustration, not an authentic exam stimulus, a mark or an inferred interpretation. Use existing media for authentic sources and Mermaid/learning_visual for relationships.',
            createdBatch: 'language-completion',
            fieldDescriptions: { start: 'start', end: 'end' },
            texts: {
                source: {
                    example: 'The restless sea battered the shore.',
                    maxLength: 150,
                    columns: 50,
                    rows: 4,
                    description: 'Exact sentence or short passage.'
                },
                annotation: {
                    example: 'Adjective',
                    maxLength: 20,
                    columns: 20,
                    rows: 1,
                    description: 'Supplied annotation for the selected span.'
                }
            }
        },
        'english.language.formal_letter': {
            title: 'Formal-letter page layout',
            fields: {},
            description:
                'A conventional letter-page arrangement places supplied address, date, recipient, salutation, body and sign-off text.',
            limitation: 'A layout teaching sample, not a complete letter generator. Names and addresses in fixtures are invented examples.',
            adaptation:
                'Address, date, salutation, body and sign-off positions. Use exact supplied text or approved original scene choices for this learning purpose. Preserve learner authorship. This is a teaching illustration, not an authentic exam stimulus, a mark or an inferred interpretation. Use existing media for authentic sources and Mermaid/learning_visual for relationships.',
            createdBatch: 'language-completion',
            fieldDescriptions: {},
            texts: {
                sender: {
                    example: `12 Orchard Lane
Greenford`,
                    maxLength: 44,
                    columns: 23,
                    rows: 2,
                    description: 'Supplied sender address or placeholder.'
                },
                date: { example: '10 October 2026', maxLength: 23, columns: 23, rows: 1, description: 'Explicit supplied letter date.' },
                recipient: {
                    example: 'The Community Centre',
                    maxLength: 32,
                    columns: 32,
                    rows: 1,
                    description: 'Supplied recipient line.'
                },
                salutation: { example: 'Dear Ms Patel,', maxLength: 32, columns: 32, rows: 1, description: 'Supplied salutation.' },
                body: {
                    example: 'I am writing to suggest a new reading group for young people.',
                    maxLength: 100,
                    columns: 36,
                    rows: 4,
                    description: 'Exact short body extract.'
                },
                signOff: { example: 'Yours sincerely, Sam', maxLength: 32, columns: 32, rows: 1, description: 'Supplied sign-off.' }
            }
        },
        'english.literature.stage_plan': {
            title: 'Stage positions and audience',
            fields: { positionA: [1, 9, 2], positionB: [1, 9, 7] },
            description: 'A nine-zone stage ground plan locates two explicitly named characters in supplied distinct zones.',
            limitation:
                'Plan viewed from the audience; stage right is the performer\u2019s right facing the audience. Blocking is a supplied proposal, not inferred from a play.',
            adaptation:
                'Generic theatre plan; explicit example blocking, not inferred plot. Provide explicit question data and supported choices. Do not guess quotations, character relationships, plot, author intention or source provenance. Use Mermaid/learning_visual for abstract relationships and verified media for authentic stimuli.',
            createdBatch: 'literature-completion',
            fieldDescriptions: {
                positionA: '1\u20133 upstage right/centre/left; 4\u20136 centre right/centre/left; 7\u20139 downstage right/centre/left.',
                positionB: 'Same zone dictionary as positionA; must differ.'
            },
            texts: {
                nameA: {
                    example: 'Speaker A',
                    maxLength: 12,
                    columns: 12,
                    rows: 1,
                    description: 'Exact supplied words; do not invent attribution or textual evidence.'
                },
                nameB: {
                    example: 'Speaker B',
                    maxLength: 12,
                    columns: 12,
                    rows: 1,
                    description: 'Exact supplied words; do not invent attribution or textual evidence.'
                }
            }
        },
        'english.literature.sonnet_form': {
            title: 'Shakespearean sonnet form',
            fields: { section: [1, 4, 1] },
            description:
                'Fourteen line slots are grouped as three quatrains and a final couplet with the conventional Shakespearean rhyme pattern. A supplied section is selected.',
            limitation: 'A form schematic, not a claim that every sonnet follows this structure or turns at a fixed line.',
            adaptation:
                'Three quatrains and final couplet; no poem reproduced. Provide explicit question data and supported choices. Do not guess quotations, character relationships, plot, author intention or source provenance. Use Mermaid/learning_visual for abstract relationships and verified media for authentic stimuli.',
            createdBatch: 'literature-completion',
            fieldDescriptions: { section: '1\u20133 select a quatrain; 4 selects the final couplet.' },
            texts: {
                annotation: {
                    example: 'First quatrain selected',
                    maxLength: 46,
                    columns: 46,
                    rows: 1,
                    description: 'Exact supplied words; do not invent attribution or textual evidence.'
                }
            }
        },
        'math.circle.semicircle': {
            title: 'Angle in a semicircle',
            fields: { givenAngle: [20, 70, 50] },
            description:
                'A angle in a semicircle. Geometry is constructed within this template\u2019s approved boundaries; visible labels and supplied values are listed with the diagram.',
            limitation:
                'Bounded teaching template. Givens are supplied explicitly; perspective views are schematic. No calculated answer or assessment evidence is emitted.',
            createdBatch: 'expansion-50-percent',
            adaptation:
                'Question-supplied semantic parameters drive the dimensions, geometric construction or discrete model. No model-authored SVG coordinates.',
            labels: {
                pointA: { match: 'A', example: 'A', maxLength: 3 },
                pointB: { match: 'B', example: 'B', maxLength: 3 },
                pointP: { match: 'P', example: 'P', maxLength: 3 }
            }
        },
        'math.circle.cyclic_quadrilateral': {
            title: 'Cyclic quadrilateral',
            fields: { givenAngle: [55, 125, 80] },
            description:
                'A cyclic quadrilateral. Geometry is constructed within this template\u2019s approved boundaries; visible labels and supplied values are listed with the diagram.',
            limitation:
                'Bounded teaching template. Givens are supplied explicitly; perspective views are schematic. No calculated answer or assessment evidence is emitted.',
            createdBatch: 'expansion-50-percent',
            adaptation:
                'Question-supplied semantic parameters drive the dimensions, geometric construction or discrete model. No model-authored SVG coordinates.',
            labels: {
                pointA: { match: 'A', example: 'A', maxLength: 3 },
                pointB: { match: 'B', example: 'B', maxLength: 3 },
                pointC: { match: 'C', example: 'C', maxLength: 3 },
                pointD: { match: 'D', example: 'D', maxLength: 3 }
            }
        },
        'math.circle.angle_centre': {
            title: 'Angle at centre',
            fields: { centralAngle: [40, 150, 110] },
            description:
                'A angle at centre. Geometry is constructed within this template\u2019s approved boundaries; visible labels and supplied values are listed with the diagram.',
            limitation:
                'Bounded teaching template. Givens are supplied explicitly; perspective views are schematic. No calculated answer or assessment evidence is emitted.',
            createdBatch: 'expansion-50-percent',
            adaptation:
                'Question-supplied semantic parameters drive the dimensions, geometric construction or discrete model. No model-authored SVG coordinates.',
            labels: {
                pointA: { match: 'A', example: 'A', maxLength: 3 },
                pointB: { match: 'B', example: 'B', maxLength: 3 },
                pointO: { match: 'O', example: 'O', maxLength: 3 },
                pointP: { match: 'P', example: 'P', maxLength: 3 }
            }
        },
        'math.construction.angle_bisector': {
            title: 'Angle bisector construction',
            fields: { angle: [30, 120, 70] },
            description:
                'A angle bisector construction. Geometry is constructed within this template\u2019s approved boundaries; visible labels and supplied values are listed with the diagram.',
            limitation:
                'Bounded teaching template. Givens are supplied explicitly; perspective views are schematic. No calculated answer or assessment evidence is emitted.',
            createdBatch: 'expansion-50-percent',
            adaptation:
                'Question-supplied semantic parameters drive the dimensions, geometric construction or discrete model. No model-authored SVG coordinates.'
        },
        'math.similarity.paired_triangles': {
            title: 'Similar triangles',
            fields: { smallBase: [0.1, 1e3, 3], smallHeight: [0.1, 1e3, 2], largeBase: [0.1, 1e3, 6] },
            description:
                'A similar triangles. Geometry is constructed within this template\u2019s approved boundaries; visible labels and supplied values are listed with the diagram.',
            limitation:
                'Bounded teaching template. Givens are supplied explicitly; perspective views are schematic. No calculated answer or assessment evidence is emitted.',
            createdBatch: 'expansion-50-percent',
            units: !0,
            adaptation:
                'Question-supplied semantic parameters drive the dimensions, geometric construction or discrete model. No model-authored SVG coordinates.'
        },
        'math.bearing.three_figure': {
            title: 'Three-figure bearing',
            fields: { bearing: [0, 359, 120] },
            description: 'An arrow runs north from A, another points towards B, and a clockwise arc records the given bearing.',
            limitation: 'Bearing is measured clockwise from north. This is a geometric schematic, not a geographical map.',
            createdBatch: 'expansion-50-percent',
            adaptation: 'Explicit question quantities adjust this bounded diagram; structure remains schematic where stated.'
        },
        'math.net.cylinder': {
            title: 'Cylinder net',
            fields: { radius: [0.1, 1e3, 3], height: [0.1, 1e3, 8] },
            description:
                'A cylinder net. Geometry is constructed within this template\u2019s approved boundaries; visible labels and supplied values are listed with the diagram.',
            limitation:
                'Bounded teaching template. Givens are supplied explicitly; perspective views are schematic. No calculated answer or assessment evidence is emitted.',
            createdBatch: 'expansion-50-percent',
            units: !0,
            adaptation:
                'Question-supplied semantic parameters drive the dimensions, geometric construction or discrete model. No model-authored SVG coordinates.'
        },
        'math.solid.pyramid': {
            title: 'Square-based pyramid',
            fields: { baseEdge: [0.1, 1e3, 6], height: [0.1, 1e3, 9] },
            description:
                'A square-based pyramid. Geometry is constructed within this template\u2019s approved boundaries; visible labels and supplied values are listed with the diagram.',
            limitation:
                'Bounded teaching template. Givens are supplied explicitly; perspective views are schematic. No calculated answer or assessment evidence is emitted.',
            createdBatch: 'expansion-50-percent',
            units: !0,
            adaptation:
                'Question-supplied semantic parameters drive the dimensions, geometric construction or discrete model. No model-authored SVG coordinates.'
        },
        'math.number.fraction_strip': {
            title: 'Fraction strip',
            fields: { parts: [2, 12, 8], shaded: [0, 12, 3] },
            description: 'One rectangular whole is divided into equal cells, with a stated number shaded.',
            limitation: 'Equal parts model; the reduced fraction or percentage is not printed.',
            createdBatch: 'expansion-50-percent',
            adaptation: 'Explicit question quantities adjust this bounded diagram; structure remains schematic where stated.'
        },
        'math.algebra.tiles': {
            title: 'Algebra area tiles',
            fields: { across: [1, 3, 2], down: [1, 3, 2] },
            description:
                'A algebra area tiles. Geometry is constructed within this template\u2019s approved boundaries; visible labels and supplied values are listed with the diagram.',
            limitation:
                'Bounded teaching template. Givens are supplied explicitly; perspective views are schematic. No calculated answer or assessment evidence is emitted.',
            createdBatch: 'expansion-50-percent',
            adaptation:
                'Question-supplied semantic parameters drive the dimensions, geometric construction or discrete model. No model-authored SVG coordinates.'
        },
        'physics.circuit.measurement': {
            title: 'Ammeter and voltmeter placement',
            fields: { supplyVoltage: [0.1, 24, 6], resistance: [1, 1e4, 100], focusMeter: [1, 2, 1] },
            description:
                'An ammeter is in series with a resistor and a voltmeter is connected across it. Supply and resistance are given; meter readings are not calculated.',
            limitation: 'Bounded teaching schematic. Explicit givens are shown without a calculated answer or new assessment evidence.',
            adaptation: 'Ammeter in series and voltmeter across component. Use explicit question data and supported structural choices.',
            createdBatch: 'physics-completion',
            fieldDescriptions: { supplyVoltage: 'V', resistance: '\u03A9', focusMeter: '1: ammeter; 2: voltmeter' }
        },
        'physics.electromagnet.solenoid': {
            title: 'Solenoid field',
            fields: { turns: [6, 16, 10], northEnd: [-1, 1, 1] },
            description:
                'A coil around an iron core has the supplied north-end orientation. Field goes towards the north end inside, returning outside.',
            limitation: 'Bounded teaching schematic. Explicit givens are shown without a calculated answer or new assessment evidence.',
            adaptation:
                'Winding and fixed field polarity; current direction not inferred. Use explicit question data and supported structural choices.',
            createdBatch: 'physics-completion',
            fieldDescriptions: {
                turns: 'An explicit bounded question quantity or approved choice.',
                northEnd: '-1: left; 1: right. This polarity is a supplied given; current direction is not inferred.'
            }
        },
        'physics.elasticity.spring': {
            title: 'Loaded spring apparatus',
            fields: { unloadedLength: [2, 50, 12], loadedLength: [3, 80, 20], loadForce: [0.1, 50, 4] },
            description:
                'An unloaded spring and the same spring under a supplied force share a support. Reference lines show the change in length.',
            limitation: 'Bounded teaching schematic. Explicit givens are shown without a calculated answer or new assessment evidence.',
            adaptation: 'Fixed support, reference length and extension. Use explicit question data and supported structural choices.',
            createdBatch: 'physics-completion',
            fieldDescriptions: { unloadedLength: 'cm', loadedLength: 'cm', loadForce: 'N' }
        },
        'physics.nuclear.radiation_penetration': {
            title: 'Radiation penetration barriers',
            fields: { aluminiumMm: [1, 8, 4], leadMm: [5, 20, 12] },
            description:
                'Qualitative alpha, beta and gamma paths meet paper, aluminium and lead. Gamma continues with attenuation; barriers are not absolute shields.',
            limitation: 'Typical qualitative penetration model; energy, material and thickness affect transmission. Not shielding design.',
            adaptation:
                'Alpha beta gamma model; attenuation not absolute shield. Use explicit question data and supported structural choices.',
            createdBatch: 'physics-completion',
            fieldDescriptions: { aluminiumMm: 'mm; qualitative barrier example', leadMm: 'mm; qualitative barrier example' }
        },
        'chemistry.apparatus.titration': {
            title: 'Titration apparatus',
            fields: { readingMl: [0, 50, 20], aliquotMl: [5, 50, 25] },
            description: 'A graduated burette with a stopcock delivers liquid into a conical flask on a white tile.',
            limitation: 'A single supplied burette reading is not a titre; the endpoint and concentration are not inferred.',
            adaptation:
                'Stand, graduated burette, stopcock, flask and white tile. Use supplied question data and the declared structural choices; do not invent absent givens.',
            createdBatch: 'chemistry-completion',
            fieldDescriptions: { readingMl: 'reading in mL', aliquotMl: 'aliquot in mL' },
            labels: {
                titrantLabel: { match: 'Titrant', example: 'Acid', maxLength: 18 },
                analyteLabel: { match: 'Analyte', example: 'Alkali', maxLength: 18 }
            }
        },
        'chemistry.apparatus.gas_syringe': {
            title: 'Gas syringe collection',
            fields: { volumeMl: [5, 100, 40], seconds: [1, 600, 60] },
            description: 'A gas-tight delivery path joins a reaction flask to a freely moving graduated gas-syringe plunger.',
            limitation: 'Volume and elapsed time are supplied; this picture does not imply a reaction-rate trend.',
            adaptation:
                'Closed delivery path and labelled volume scale. Use supplied question data and the declared structural choices; do not invent absent givens.',
            createdBatch: 'chemistry-completion',
            fieldDescriptions: { volumeMl: 'volume in mL', seconds: 'seconds' },
            labels: { reactantsLabel: { match: 'Reactants', example: 'Sample A', maxLength: 18 } }
        },
        'chemistry.material.corrosion': {
            title: 'Rusting experiment',
            fields: { days: [1, 30, 7], wetTubeRust: [0, 1, 0] },
            description: 'Three iron-nail tubes compare dry air, boiled water under oil and air with water.',
            limitation: 'Rust marks represent a supplied observation, not a time-dependent prediction.',
            adaptation:
                'Air and water comparison conditions in three tubes. Use supplied question data and the declared structural choices; do not invent absent givens.',
            createdBatch: 'chemistry-completion',
            fieldDescriptions: { days: 'days', wetTubeRust: 'wetTubeRust' }
        },
        'biology.plant.root_hair': {
            title: 'Root hair cell',
            fields: { uptake: [1, 2, 1], lengthUm: [50, 500, 180] },
            description:
                'A root hair cell projects between soil particles, with an approved water-uptake or active mineral-uptake example.',
            limitation:
                'Water enters by osmosis. The active mineral example is a selected against-gradient case; not all ion movement is active.',
            adaptation:
                'Large exchange surface and soil water. Select approved structures and use supplied observations only; do not invent absent measurements.',
            createdBatch: 'biology-completion',
            fieldDescriptions: {
                uptake: '1 water by osmosis; 2 selected active mineral-ion uptake.',
                lengthUm: 'Given root-hair length in micrometres; outline remains schematic.'
            }
        },
        'biology.neural.neurone': {
            title: 'Neurone structure',
            fields: { myelinSegments: [4, 6, 5], focusPart: [1, 3, 1] },
            description: 'A motor neurone connects a cell body and dendrites to a myelinated axon and terminal branches.',
            limitation: 'Sheath segments are illustrative, not a count of Schwann cells in a complete neurone.',
            adaptation:
                'Dendrites, cell body, myelin and axon terminals. Select approved structures and use supplied observations only; do not invent absent measurements.',
            createdBatch: 'biology-completion',
            fieldDescriptions: { myelinSegments: 'myelinSegments', focusPart: '1 cell body; 2 myelin sheath; 3 terminals.' }
        },
        'biology.organ.blood_vessels': {
            title: 'Artery and vein sections',
            fields: { focusVessel: [1, 3, 1] },
            description:
                'Artery, vein and capillary sections compare wall and lumen structure; a longitudinal detail shows a venous valve.',
            limitation: 'Sections use different illustrative scales. Not all veins have valves. No blood pressure is inferred.',
            adaptation:
                'Relative walls, lumen and venous valves. Select approved structures and use supplied observations only; do not invent absent measurements.',
            createdBatch: 'biology-completion',
            fieldDescriptions: { focusVessel: 'Highlight 1 artery; 2 vein; 3 capillary.' }
        },
        'biology.ecology.quadrat': {
            title: 'Quadrat sampling layout',
            fields: { topLeft: [0, 6, 2], topRight: [0, 6, 4], bottomLeft: [0, 6, 1], bottomRight: [0, 6, 3], sideM: [0.1, 2, 1] },
            description: 'A four-cell quadrat shows supplied organism counts in each recorded cell and the given quadrat side.',
            limitation:
                'Within-cell symbol positions are illustrative, not measured organism coordinates. Density and total count are left for the learner.',
            adaptation:
                'Known sampling cells and supplied counts; within-cell positions schematic. Select approved structures and use supplied observations only; do not invent absent measurements.',
            createdBatch: 'biology-completion',
            fieldDescriptions: {
                topLeft: 'topLeft',
                topRight: 'topRight',
                bottomLeft: 'bottomLeft',
                bottomRight: 'bottomRight',
                sideM: 'sideM'
            },
            labels: { sampleLabel: { match: 'Sample', example: 'Sample A', maxLength: 16 } }
        },
        'geography.coast.headland_bay': {
            title: 'Headland and bay plan',
            fields: { bayIndentM: [100, 450, 280] },
            description: 'Contrasting resistant and weaker rock produce projecting headlands and recessed bays under wave attack.',
            limitation: 'Idealised differential erosion, not a named coastal geology map.',
            adaptation:
                'Differential erosion of contrasting geology. Use supplied observations and approved model choices only. This schematic is not evidence of a real location.',
            createdBatch: 'geography-completion',
            fieldDescriptions: { bayIndentM: 'bayIndentM' }
        },
        'geography.glacial.valley': {
            title: 'U-shaped glacial valley',
            fields: { floorWidthM: [100, 400, 250] },
            description: 'A glacial trough has steep sides and a broad floor, with a small residual stream.',
            limitation: 'Given floor width does not uniquely determine a valley shape. Section is schematic and vertically exaggerated.',
            adaptation:
                'Steep sides, broad floor and schematic cross-section. Use supplied observations and approved model choices only. This schematic is not evidence of a real location.',
            createdBatch: 'geography-completion',
            fieldDescriptions: { floorWidthM: 'floorWidthM' }
        },
        'history.medicine.pasteur_flask': {
            title: 'Swan-neck flask experiment',
            fields: { neckIntact: [0, 1, 1] },
            description: 'A swan-neck flask separates access by air from the route taken by dust into broth.',
            limitation:
                'Pasteur-era experiment principle. No measured growth rate or supplied experimental result is invented. Original teaching reconstruction, not an authentic historical source.',
            adaptation:
                'Neck geometry, broth and dust trapping. Choose this only for structural or spatial explanation. Use supplied question intent to select the approved feature or model extent. Counts are illustrative unless separately evidenced; never infer site, date, capacity or event details. Use verified images for authentic source analysis and Mermaid/learning_visual for causal relationships.',
            createdBatch: 'history-completion',
            fieldDescriptions: { neckIntact: '1 intact swan neck traps dust while admitting air; 0 broken neck permits dust entry.' }
        },
        'english.language.focus_frame': {
            title: 'Descriptive focus framing',
            fields: { focus: [1, 3, 1] },
            description: 'Nested focus frames select an approved portion of one original scene.',
            limitation: 'Selected framing guides observation; it does not infer a writer\u2019s intention.',
            adaptation:
                'Wide view, mid-view and detail crop of an original scene. Use exact supplied text or approved original scene choices for this learning purpose. Preserve learner authorship. This is a teaching illustration, not an authentic exam stimulus, a mark or an inferred interpretation. Use existing media for authentic sources and Mermaid/learning_visual for relationships.',
            createdBatch: 'language-completion',
            fieldDescriptions: { focus: '1 wide scene; 2 building; 3 door detail.' }
        },
        'english.literature.thrust_theatre': {
            title: 'Thrust-theatre structure',
            fields: { galleryLevels: [1, 3, 2] },
            description: 'A generic thrust stage projects into a yard with surrounding gallery bands and a tiring-house area.',
            limitation:
                'An abstract plan, not a historically measured reconstruction or evidence for the exact form of any particular theatre.',
            adaptation:
                'Stage, yard, galleries and tiring house. Provide explicit question data and supported choices. Do not guess quotations, character relationships, plot, author intention or source provenance. Use Mermaid/learning_visual for abstract relationships and verified media for authentic stimuli.',
            createdBatch: 'literature-completion',
            fieldDescriptions: { galleryLevels: 'galleryLevels' }
        },
        'math.angle.triangle_sum': {
            title: 'Triangle angle sum',
            fields: { angleA: [25, 80, 50], angleB: [25, 80, 40] },
            description:
                'A triangle angle sum. Geometry is constructed within this template\u2019s approved boundaries; visible labels and supplied values are listed with the diagram.',
            limitation:
                'Bounded teaching template. Givens are supplied explicitly; perspective views are schematic. No calculated answer or assessment evidence is emitted.',
            createdBatch: 'goal-completion',
            adaptation:
                'Question-supplied semantic parameters drive the dimensions, geometric construction or discrete model. No model-authored SVG coordinates.',
            labels: {
                pointA: { match: 'A', example: 'A', maxLength: 3 },
                pointB: { match: 'B', example: 'B', maxLength: 3 },
                pointC: { match: 'C', example: 'C', maxLength: 3 }
            }
        },
        'math.angle.exterior_polygon': {
            title: 'Polygon exterior angle',
            fields: { sides: [3, 10, 5] },
            description:
                'A polygon exterior angle. Geometry is constructed within this template\u2019s approved boundaries; visible labels and supplied values are listed with the diagram.',
            limitation:
                'Bounded teaching template. Givens are supplied explicitly; perspective views are schematic. No calculated answer or assessment evidence is emitted.',
            createdBatch: 'goal-completion',
            adaptation:
                'Question-supplied semantic parameters drive the dimensions, geometric construction or discrete model. No model-authored SVG coordinates.'
        },
        'math.circle.same_segment': {
            title: 'Angles in the same segment',
            fields: { givenAngle: [30, 70, 50] },
            description:
                'A angles in the same segment. Geometry is constructed within this template\u2019s approved boundaries; visible labels and supplied values are listed with the diagram.',
            limitation:
                'Bounded teaching template. Givens are supplied explicitly; perspective views are schematic. No calculated answer or assessment evidence is emitted.',
            createdBatch: 'goal-completion',
            adaptation:
                'Question-supplied semantic parameters drive the dimensions, geometric construction or discrete model. No model-authored SVG coordinates.',
            labels: {
                pointA: { match: 'A', example: 'A', maxLength: 3 },
                pointB: { match: 'B', example: 'B', maxLength: 3 },
                pointP: { match: 'P', example: 'P', maxLength: 3 },
                pointQ: { match: 'Q', example: 'Q', maxLength: 3 }
            }
        },
        'math.circle.alternate_segment': {
            title: 'Alternate segment theorem',
            fields: { givenAngle: [25, 70, 50] },
            description:
                'A alternate segment theorem. Geometry is constructed within this template\u2019s approved boundaries; visible labels and supplied values are listed with the diagram.',
            limitation:
                'Bounded teaching template. Givens are supplied explicitly; perspective views are schematic. No calculated answer or assessment evidence is emitted.',
            createdBatch: 'goal-completion',
            adaptation:
                'Question-supplied semantic parameters drive the dimensions, geometric construction or discrete model. No model-authored SVG coordinates.',
            labels: {
                pointA: { match: 'A', example: 'A', maxLength: 3 },
                pointB: { match: 'B', example: 'B', maxLength: 3 },
                pointP: { match: 'P', example: 'P', maxLength: 3 }
            }
        },
        'math.circle.equal_tangents': {
            title: 'Two tangents from a point',
            fields: { radius: [0.1, 1e3, 4], tangentLength: [0.1, 1e3, 7] },
            description:
                'A two tangents from a point. Geometry is constructed within this template\u2019s approved boundaries; visible labels and supplied values are listed with the diagram.',
            limitation:
                'Bounded teaching template. Givens are supplied explicitly; perspective views are schematic. No calculated answer or assessment evidence is emitted.',
            createdBatch: 'goal-completion',
            units: !0,
            adaptation:
                'Question-supplied semantic parameters drive the dimensions, geometric construction or discrete model. No model-authored SVG coordinates.',
            labels: {
                pointA: { match: 'A', example: 'A', maxLength: 3 },
                pointB: { match: 'B', example: 'B', maxLength: 3 },
                pointO: { match: 'O', example: 'O', maxLength: 3 },
                pointP: { match: 'P', example: 'P', maxLength: 3 }
            }
        },
        'math.locus.fixed_distance_point': {
            title: 'Locus around a point',
            fields: { radius: [0.1, 1e3, 5] },
            description:
                'A locus around a point. Geometry is constructed within this template\u2019s approved boundaries; visible labels and supplied values are listed with the diagram.',
            limitation:
                'Bounded teaching template. Givens are supplied explicitly; perspective views are schematic. No calculated answer or assessment evidence is emitted.',
            createdBatch: 'goal-completion',
            units: !0,
            adaptation:
                'Question-supplied semantic parameters drive the dimensions, geometric construction or discrete model. No model-authored SVG coordinates.',
            labels: { pointP: { match: 'P', example: 'P', maxLength: 3 } }
        },
        'math.locus.fixed_distance_segment': {
            title: 'Locus around a line segment',
            fields: { length: [0.1, 1e3, 8], distance: [0.1, 1e3, 3] },
            description:
                'A locus around a line segment. Geometry is constructed within this template\u2019s approved boundaries; visible labels and supplied values are listed with the diagram.',
            limitation:
                'Bounded teaching template. Givens are supplied explicitly; perspective views are schematic. No calculated answer or assessment evidence is emitted.',
            createdBatch: 'goal-completion',
            units: !0,
            adaptation:
                'Question-supplied semantic parameters drive the dimensions, geometric construction or discrete model. No model-authored SVG coordinates.',
            labels: { pointA: { match: 'A', example: 'A', maxLength: 3 }, pointB: { match: 'B', example: 'B', maxLength: 3 } }
        },
        'math.construction.sss_triangle': {
            title: 'SSS triangle construction',
            fields: { base: [1, 100, 6], left: [1, 100, 5], right: [1, 100, 5] },
            units: !0,
            description:
                'Triangle ABC constructed from three supplied side lengths. Equal-radius compass arcs intersect at C; dimensions mark AB, AC and BC.',
            limitation: 'Schematic teaching model. Supplied quantities are explicit; no calculated answer or marking evidence is emitted.',
            createdBatch: 'goal-completion',
            labels: {
                pointA: { match: 'A', example: 'A', maxLength: 3 },
                pointB: { match: 'B', example: 'B', maxLength: 3 },
                pointC: { match: 'C', example: 'C', maxLength: 3 }
            },
            adaptation: 'Explicit question quantities adjust this bounded diagram; structure remains schematic where stated.'
        },
        'math.congruence.triangle_conditions': {
            title: 'Congruent triangle evidence',
            fields: { base: [0.1, 1e3, 6], height: [0.1, 1e3, 5] },
            description:
                'A congruent triangle evidence. Geometry is constructed within this template\u2019s approved boundaries; visible labels and supplied values are listed with the diagram.',
            limitation:
                'Bounded teaching template. Givens are supplied explicitly; perspective views are schematic. No calculated answer or assessment evidence is emitted. SAS right-triangle case only.',
            createdBatch: 'goal-completion',
            units: !0,
            adaptation:
                'Question-supplied semantic parameters drive the dimensions, geometric construction or discrete model. No model-authored SVG coordinates.'
        },
        'math.transformation.reflection': {
            title: 'Static reflection construction',
            fields: { width: [0.1, 1e3, 4], height: [0.1, 1e3, 6], gap: [0.1, 1e3, 3] },
            description:
                'A static reflection construction. Geometry is constructed within this template\u2019s approved boundaries; visible labels and supplied values are listed with the diagram.',
            limitation:
                'Bounded teaching template. Givens are supplied explicitly; perspective views are schematic. No calculated answer or assessment evidence is emitted.',
            createdBatch: 'goal-completion',
            units: !0,
            adaptation:
                'Question-supplied semantic parameters drive the dimensions, geometric construction or discrete model. No model-authored SVG coordinates.'
        },
        'math.transformation.rotation': {
            title: 'Static rotation construction',
            fields: { turn: [90, 270, 90] },
            description:
                'A static rotation construction. Geometry is constructed within this template\u2019s approved boundaries; visible labels and supplied values are listed with the diagram.',
            limitation:
                'Bounded teaching template. Givens are supplied explicitly; perspective views are schematic. No calculated answer or assessment evidence is emitted.',
            createdBatch: 'goal-completion',
            adaptation:
                'Question-supplied semantic parameters drive the dimensions, geometric construction or discrete model. No model-authored SVG coordinates.'
        },
        'math.transformation.enlargement': {
            title: 'Centre of enlargement construction',
            fields: { base: [1, 10, 4], height: [1, 10, 3], scale: [1.5, 3, 2] },
            description:
                'A centre of enlargement construction. Geometry is constructed within this template\u2019s approved boundaries; visible labels and supplied values are listed with the diagram.',
            limitation:
                'Bounded teaching template. Givens are supplied explicitly; perspective views are schematic. No calculated answer or assessment evidence is emitted.',
            createdBatch: 'goal-completion',
            adaptation:
                'Question-supplied semantic parameters drive the dimensions, geometric construction or discrete model. No model-authored SVG coordinates.',
            units: !0
        },
        'math.vector.triangle': {
            title: 'Vector triangle geometry',
            fields: { first: [1, 100, 5], second: [1, 100, 7], includedAngle: [35, 120, 80] },
            description:
                'A vector triangle geometry. Geometry is constructed within this template\u2019s approved boundaries; visible labels and supplied values are listed with the diagram.',
            limitation:
                'Bounded teaching template. Givens are supplied explicitly; perspective views are schematic. No calculated answer or assessment evidence is emitted.',
            createdBatch: 'goal-completion',
            adaptation:
                'Question-supplied semantic parameters drive the dimensions, geometric construction or discrete model. No model-authored SVG coordinates.'
        },
        'math.vector.parallelogram': {
            title: 'Vector parallelogram geometry',
            fields: { first: [1, 100, 6], second: [1, 100, 5], includedAngle: [35, 100, 60] },
            description:
                'A vector parallelogram geometry. Geometry is constructed within this template\u2019s approved boundaries; visible labels and supplied values are listed with the diagram.',
            limitation:
                'Bounded teaching template. Givens are supplied explicitly; perspective views are schematic. No calculated answer or assessment evidence is emitted.',
            createdBatch: 'goal-completion',
            adaptation:
                'Question-supplied semantic parameters drive the dimensions, geometric construction or discrete model. No model-authored SVG coordinates.'
        },
        'math.trigonometry.elevation': {
            title: 'Angle of elevation',
            fields: { angle: [20, 65, 35], distance: [0.1, 1e3, 12] },
            description:
                'A angle of elevation. Geometry is constructed within this template\u2019s approved boundaries; visible labels and supplied values are listed with the diagram.',
            limitation:
                'Bounded teaching template. Givens are supplied explicitly; perspective views are schematic. No calculated answer or assessment evidence is emitted.',
            createdBatch: 'goal-completion',
            adaptation:
                'Question-supplied semantic parameters drive the dimensions, geometric construction or discrete model. No model-authored SVG coordinates.',
            units: !0
        },
        'math.geometry.chord_bisector': {
            title: 'Perpendicular from centre to chord',
            fields: { radius: [0.1, 1e3, 6], chordLength: [0.1, 1e3, 10] },
            description:
                'A perpendicular from centre to chord. Geometry is constructed within this template\u2019s approved boundaries; visible labels and supplied values are listed with the diagram.',
            limitation:
                'Bounded teaching template. Givens are supplied explicitly; perspective views are schematic. No calculated answer or assessment evidence is emitted.',
            createdBatch: 'goal-completion',
            units: !0,
            adaptation:
                'Question-supplied semantic parameters drive the dimensions, geometric construction or discrete model. No model-authored SVG coordinates.',
            labels: {
                pointA: { match: 'A', example: 'A', maxLength: 3 },
                pointB: { match: 'B', example: 'B', maxLength: 3 },
                pointO: { match: 'O', example: 'O', maxLength: 3 },
                pointM: { match: 'M', example: 'M', maxLength: 3 }
            }
        },
        'math.geometry.inscribed_polygon': {
            title: 'Regular polygon inside a circle',
            fields: { sides: [3, 10, 6] },
            description:
                'A regular polygon inside a circle. Geometry is constructed within this template\u2019s approved boundaries; visible labels and supplied values are listed with the diagram.',
            limitation:
                'Bounded teaching template. Givens are supplied explicitly; perspective views are schematic. No calculated answer or assessment evidence is emitted.',
            createdBatch: 'goal-completion',
            adaptation:
                'Question-supplied semantic parameters drive the dimensions, geometric construction or discrete model. No model-authored SVG coordinates.'
        },
        'math.geometry.regular_tessellation': {
            title: 'Regular tessellation',
            fields: { sides: [3, 6, 3] },
            description:
                'A regular tessellation. Geometry is constructed within this template\u2019s approved boundaries; visible labels and supplied values are listed with the diagram.',
            limitation:
                'Bounded teaching template. Givens are supplied explicitly; perspective views are schematic. No calculated answer or assessment evidence is emitted.',
            createdBatch: 'goal-completion',
            adaptation:
                'Question-supplied semantic parameters drive the dimensions, geometric construction or discrete model. No model-authored SVG coordinates.'
        },
        'math.construction.perpendicular_point': {
            title: 'Perpendicular from point to line',
            fields: { height: [0.1, 1e3, 4], compassRadius: [0.1, 1e3, 6] },
            description:
                'A perpendicular from point to line. Geometry is constructed within this template\u2019s approved boundaries; visible labels and supplied values are listed with the diagram.',
            limitation:
                'Bounded teaching template. Givens are supplied explicitly; perspective views are schematic. No calculated answer or assessment evidence is emitted.',
            createdBatch: 'goal-completion',
            units: !0,
            adaptation:
                'Question-supplied semantic parameters drive the dimensions, geometric construction or discrete model. No model-authored SVG coordinates.',
            labels: {
                pointP: { match: 'P', example: 'P', maxLength: 3 },
                pointA: { match: 'A', example: 'A', maxLength: 3 },
                pointB: { match: 'B', example: 'B', maxLength: 3 },
                pointQ: { match: 'Q', example: 'Q', maxLength: 3 }
            }
        },
        'math.locus.intersection_regions': {
            title: 'Intersecting locus regions',
            fields: { radiusA: [0.1, 1e3, 5], radiusB: [0.1, 1e3, 5], separation: [0.1, 1e3, 6] },
            description: 'A intersecting locus regions. Its bounded geometry and question values are supplied explicitly.',
            limitation: 'Bounded teaching schematic. No calculated answer is printed. Perspective drawings are not to scale.',
            createdBatch: 'goal-completion',
            adaptation: 'Question parameters adjust the construction or dimensions. Model-supplied SVG coordinates are not accepted.',
            units: !0,
            labels: { pointA: { match: 'A', example: 'A', maxLength: 3 }, pointB: { match: 'B', example: 'B', maxLength: 3 } }
        },
        'math.trigonometry.non_right': {
            title: 'Non-right triangle for sine/cosine rules',
            fields: { a: [1, 100, 7], b: [1, 100, 5], c: [1, 100, 8] },
            description:
                'A non-right triangle for sine/cosine rules. Geometry is constructed within this template\u2019s approved boundaries; visible labels and supplied values are listed with the diagram.',
            limitation:
                'Bounded teaching template. Givens are supplied explicitly; perspective views are schematic. No calculated answer or assessment evidence is emitted.',
            createdBatch: 'goal-completion',
            units: !0,
            adaptation:
                'Question-supplied semantic parameters drive the dimensions, geometric construction or discrete model. No model-authored SVG coordinates.',
            labels: {
                pointA: { match: 'A', example: 'A', maxLength: 3 },
                pointB: { match: 'B', example: 'B', maxLength: 3 },
                pointC: { match: 'C', example: 'C', maxLength: 3 }
            }
        },
        'math.geometry.triangle_circumcircle': {
            title: 'Circumcircle of a triangle',
            fields: { base: [1, 100, 6], left: [1, 100, 5], right: [1, 100, 7] },
            description:
                'A circumcircle of a triangle. Geometry is constructed within this template\u2019s approved boundaries; visible labels and supplied values are listed with the diagram.',
            limitation:
                'Bounded teaching template. Givens are supplied explicitly; perspective views are schematic. No calculated answer or assessment evidence is emitted.',
            createdBatch: 'goal-completion',
            units: !0,
            adaptation:
                'Question-supplied semantic parameters drive the dimensions, geometric construction or discrete model. No model-authored SVG coordinates.',
            labels: {
                pointA: { match: 'A', example: 'A', maxLength: 3 },
                pointB: { match: 'B', example: 'B', maxLength: 3 },
                pointC: { match: 'C', example: 'C', maxLength: 3 },
                pointO: { match: 'O', example: 'O', maxLength: 3 }
            }
        },
        'math.geometry.bisected_composite': {
            title: 'Composite region with circular cut-out',
            fields: { width: [0.1, 1e3, 12], height: [0.1, 1e3, 8], radius: [0.1, 1e3, 2] },
            description:
                'A composite region with circular cut-out. Geometry is constructed within this template\u2019s approved boundaries; visible labels and supplied values are listed with the diagram.',
            limitation:
                'Bounded teaching template. Givens are supplied explicitly; perspective views are schematic. No calculated answer or assessment evidence is emitted.',
            createdBatch: 'goal-completion',
            units: !0,
            adaptation:
                'Question-supplied semantic parameters drive the dimensions, geometric construction or discrete model. No model-authored SVG coordinates.'
        },
        'math.geometry.scale_drawing': {
            title: 'Scale drawing with dimension key',
            fields: { length: [0.1, 1e3, 6], width: [0.1, 1e3, 4], scale: [10, 1e3, 100] },
            description:
                'A scale drawing with dimension key. Geometry is constructed within this template\u2019s approved boundaries; visible labels and supplied values are listed with the diagram.',
            limitation:
                'Bounded teaching template. Givens are supplied explicitly; perspective views are schematic. No calculated answer or assessment evidence is emitted. Original-paper scale only: responsive screen size must not be measured.',
            createdBatch: 'goal-completion',
            adaptation:
                'Question-supplied semantic parameters drive the dimensions, geometric construction or discrete model. No model-authored SVG coordinates.',
            units: !0,
            exampleUnits: 'm'
        },
        'math.number.double_line': {
            title: 'Double number line',
            fields: { massStep: [0.1, 1e3, 2], costStep: [0.1, 1e3, 5], steps: [2, 5, 3] },
            description:
                'A double number line. Geometry is constructed within this template\u2019s approved boundaries; visible labels and supplied values are listed with the diagram.',
            limitation:
                'Bounded teaching template. Givens are supplied explicitly; perspective views are schematic. No calculated answer or assessment evidence is emitted.',
            createdBatch: 'goal-completion',
            adaptation:
                'Question-supplied semantic parameters drive the dimensions, geometric construction or discrete model. No model-authored SVG coordinates.'
        },
        'math.number.place_value': {
            title: 'Place-value block model',
            fields: { hundreds: [0, 3, 1], tens: [0, 9, 3], ones: [0, 9, 2] },
            description:
                'A place-value block model. Geometry is constructed within this template\u2019s approved boundaries; visible labels and supplied values are listed with the diagram.',
            limitation:
                'Bounded teaching template. Givens are supplied explicitly; perspective views are schematic. No calculated answer or assessment evidence is emitted.',
            createdBatch: 'goal-completion',
            adaptation:
                'Question-supplied semantic parameters drive the dimensions, geometric construction or discrete model. No model-authored SVG coordinates.'
        },
        'math.number.integer_counters': {
            title: 'Signed integer counters',
            fields: { positive: [0, 10, 8], negative: [0, 10, 5] },
            description:
                'Positive and negative counters appear in two aligned rows. Dashed joins pair one positive with one negative, representing zero pairs.',
            limitation: 'Schematic teaching model. Supplied quantities are explicit; no calculated answer or marking evidence is emitted.',
            createdBatch: 'goal-completion',
            adaptation: 'Explicit question quantities adjust this bounded diagram; structure remains schematic where stated.'
        },
        'math.number.percentage_grid': {
            title: 'Hundred-square percentage model',
            fields: { shaded: [0, 100, 35] },
            description: 'A ten-by-ten grid contains exactly one hundred equal cells. A stated number of cells is shaded in row order.',
            limitation: 'Schematic teaching model. Supplied quantities are explicit; no calculated answer or marking evidence is emitted.',
            createdBatch: 'goal-completion',
            adaptation: 'Explicit question quantities adjust this bounded diagram; structure remains schematic where stated.'
        },
        'math.net.cone': {
            title: 'Cone net',
            fields: { radius: [0.1, 1e3, 3], slant: [0.1, 1e3, 9] },
            description:
                'A cone net. Geometry is constructed within this template\u2019s approved boundaries; visible labels and supplied values are listed with the diagram.',
            limitation:
                'Bounded teaching template. Givens are supplied explicitly; perspective views are schematic. No calculated answer or assessment evidence is emitted.',
            createdBatch: 'goal-completion',
            units: !0,
            adaptation:
                'Question-supplied semantic parameters drive the dimensions, geometric construction or discrete model. No model-authored SVG coordinates.'
        },
        'math.solid.frustum': {
            title: 'Conical frustum',
            fields: { topRadius: [0.1, 1e3, 3], bottomRadius: [0.1, 1e3, 7], height: [0.1, 1e3, 10] },
            description:
                'A conical frustum. Geometry is constructed within this template\u2019s approved boundaries; visible labels and supplied values are listed with the diagram.',
            limitation:
                'Bounded teaching template. Givens are supplied explicitly; perspective views are schematic. No calculated answer or assessment evidence is emitted.',
            createdBatch: 'goal-completion',
            units: !0,
            adaptation:
                'Question-supplied semantic parameters drive the dimensions, geometric construction or discrete model. No model-authored SVG coordinates.'
        },
        'math.solid.hemisphere': {
            title: 'Hemisphere cut section',
            fields: { radius: [0.1, 1e3, 6] },
            description:
                'A hemisphere cut section. Geometry is constructed within this template\u2019s approved boundaries; visible labels and supplied values are listed with the diagram.',
            limitation:
                'Bounded teaching template. Givens are supplied explicitly; perspective views are schematic. No calculated answer or assessment evidence is emitted.',
            createdBatch: 'goal-completion',
            units: !0,
            adaptation:
                'Question-supplied semantic parameters drive the dimensions, geometric construction or discrete model. No model-authored SVG coordinates.'
        },
        'math.solid.hollow_cylinder': {
            title: 'Hollow cylindrical tube',
            fields: { innerRadius: [0.1, 1e3, 3], outerRadius: [0.1, 1e3, 6], length: [0.1, 1e3, 12] },
            description:
                'A hollow cylindrical tube. Geometry is constructed within this template\u2019s approved boundaries; visible labels and supplied values are listed with the diagram.',
            limitation:
                'Bounded teaching template. Givens are supplied explicitly; perspective views are schematic. No calculated answer or assessment evidence is emitted. Transparent cutaway exposes interior edges.',
            createdBatch: 'goal-completion',
            units: !0,
            adaptation:
                'Question-supplied semantic parameters drive the dimensions, geometric construction or discrete model. No model-authored SVG coordinates.'
        },
        'math.solid.composite': {
            title: 'Joined solids',
            fields: { radius: [0.1, 1e3, 5], cylinderHeight: [0.1, 1e3, 8] },
            description:
                'A joined solids. Geometry is constructed within this template\u2019s approved boundaries; visible labels and supplied values are listed with the diagram.',
            limitation:
                'Bounded teaching template. Givens are supplied explicitly; perspective views are schematic. No calculated answer or assessment evidence is emitted.',
            createdBatch: 'goal-completion',
            units: !0,
            adaptation:
                'Question-supplied semantic parameters drive the dimensions, geometric construction or discrete model. No model-authored SVG coordinates.'
        },
        'math.solid.oblique_section': {
            title: 'Plane slicing a solid',
            fields: { leftHeight: [0.1, 1e3, 6], rightHeight: [0.1, 1e3, 4], solidHeight: [0.1, 1e3, 10] },
            description: 'A plane slicing a solid. Its bounded geometry and question values are supplied explicitly.',
            limitation: 'Bounded teaching schematic. No calculated answer is printed. Perspective drawings are not to scale.',
            createdBatch: 'goal-completion',
            adaptation: 'Question parameters adjust the construction or dimensions. Model-supplied SVG coordinates are not accepted.',
            units: !0
        },
        'math.solid.orthographic': {
            title: 'Plan and orthographic elevations',
            fields: {
                totalWidth: [0.1, 1e3, 8],
                tallHeight: [0.1, 1e3, 7],
                stepWidth: [0.1, 1e3, 4],
                shortHeight: [0.1, 1e3, 3],
                depth: [0.1, 1e3, 3]
            },
            description: 'A plan and orthographic elevations. Its bounded geometry and question values are supplied explicitly.',
            limitation: 'Bounded teaching schematic. No calculated answer is printed. Perspective drawings are not to scale.',
            createdBatch: 'goal-completion',
            adaptation: 'Question parameters adjust the construction or dimensions. Model-supplied SVG coordinates are not accepted.',
            units: !0
        },
        'math.solid.isometric_cubes': {
            title: 'Isometric cube assembly',
            fields: { steps: [2, 4, 3], depth: [1, 2, 1] },
            description: 'A isometric cube assembly. Its bounded geometry and question values are supplied explicitly.',
            limitation: 'Bounded teaching schematic. No calculated answer is printed. Perspective drawings are not to scale.',
            createdBatch: 'goal-completion',
            adaptation: 'Question parameters adjust the construction or dimensions. Model-supplied SVG coordinates are not accepted.'
        },
        'math.net.pyramid': {
            title: 'Square-pyramid net',
            fields: { baseEdge: [0.1, 1e3, 6], slantHeight: [0.1, 1e3, 7] },
            description:
                'A square-pyramid net. Geometry is constructed within this template\u2019s approved boundaries; visible labels and supplied values are listed with the diagram.',
            limitation:
                'Bounded teaching template. Givens are supplied explicitly; perspective views are schematic. No calculated answer or assessment evidence is emitted.',
            createdBatch: 'goal-completion',
            units: !0,
            adaptation:
                'Question-supplied semantic parameters drive the dimensions, geometric construction or discrete model. No model-authored SVG coordinates.'
        },
        'math.net.tetrahedron': {
            title: 'Tetrahedron net',
            fields: { edge: [0.1, 1e3, 5] },
            description: 'A tetrahedron net. Its bounded geometry and question values are supplied explicitly.',
            limitation: 'Bounded teaching schematic. No calculated answer is printed. Perspective drawings are not to scale.',
            createdBatch: 'goal-completion',
            adaptation: 'Question parameters adjust the construction or dimensions. Model-supplied SVG coordinates are not accepted.',
            units: !0
        },
        'math.net.triangular_prism': {
            title: 'Triangular-prism net',
            fields: { side: [0.1, 1e3, 5], length: [0.1, 1e3, 9] },
            description:
                'A triangular-prism net. Geometry is constructed within this template\u2019s approved boundaries; visible labels and supplied values are listed with the diagram.',
            limitation:
                'Bounded teaching template. Givens are supplied explicitly; perspective views are schematic. No calculated answer or assessment evidence is emitted. Equilateral triangular end faces only.',
            createdBatch: 'goal-completion',
            units: !0,
            adaptation:
                'Question-supplied semantic parameters drive the dimensions, geometric construction or discrete model. No model-authored SVG coordinates.'
        },
        'math.trigonometry.three_dimensional': {
            title: 'Right triangles inside a cuboid',
            fields: { length: [0.1, 1e3, 8], width: [0.1, 1e3, 5], height: [0.1, 1e3, 6] },
            description:
                'A right triangles inside a cuboid. Geometry is constructed within this template\u2019s approved boundaries; visible labels and supplied values are listed with the diagram.',
            limitation:
                'Bounded teaching template. Givens are supplied explicitly; perspective views are schematic. No calculated answer or assessment evidence is emitted.',
            createdBatch: 'goal-completion',
            units: !0,
            adaptation:
                'Question-supplied semantic parameters drive the dimensions, geometric construction or discrete model. No model-authored SVG coordinates.'
        },
        'physics.circuit.potential_divider': {
            title: 'Potential divider circuit',
            fields: { supplyVoltage: [0.1, 24, 9], upperResistance: [1, 1e4, 200], lowerResistance: [1, 1e4, 100] },
            description: 'Two series resistors form an unloaded potential divider. Output terminals connect across the lower resistor.',
            limitation: 'Bounded teaching schematic. Explicit givens are shown without a calculated answer or new assessment evidence.',
            adaptation: 'Two resistive elements and output terminals. Use explicit question data and supported structural choices.',
            createdBatch: 'physics-completion',
            fieldDescriptions: { supplyVoltage: 'V', upperResistance: '\u03A9', lowerResistance: '\u03A9' }
        },
        'physics.electricity.plug': {
            title: 'Three-pin plug cutaway',
            fields: { fuseAmps: [3, 13, 3], focusPart: [1, 5, 1] },
            description:
                'Inside-view educational drawing of a UK three-pin plug. Earth is green/yellow, live is brown through a fuse and neutral is blue. The cable grip holds the outer sheath.',
            limitation: 'Educational cutaway, not a wiring or fuse-selection instruction; fuse rating is a supplied question value.',
            adaptation: 'UK wiring, fuse and cable grip. Use explicit question data and supported structural choices.',
            createdBatch: 'physics-completion',
            fieldDescriptions: {
                fuseAmps: 'A; supplied rating, never infer which fuse to fit',
                focusPart: '1: earth; 2: live; 3: neutral; 4: fuse; 5: cable grip'
            }
        },
        'physics.electricity.transformer': {
            title: 'Transformer construction',
            fields: { primaryTurns: [10, 2e3, 200], secondaryTurns: [10, 2e3, 100], primaryVoltage: [0.1, 1e4, 12] },
            description:
                'An AC primary winding and a separate secondary winding share an iron core. Explicit turn counts and input voltage label schematic windings.',
            limitation: 'Turns are schematic; printed counts are the actual givens. No calculated secondary voltage is printed.',
            adaptation: 'Separate coils and laminated core; turns given. Use explicit question data and supported structural choices.',
            createdBatch: 'physics-completion',
            fieldDescriptions: {
                primaryTurns: 'An explicit bounded question quantity or approved choice.',
                secondaryTurns: 'An explicit bounded question quantity or approved choice.',
                primaryVoltage: 'V AC'
            }
        },
        'physics.motor.simple': {
            title: 'Simple motor structure',
            fields: { supplyVoltage: [1, 24, 6], focusPart: [1, 3, 2] },
            description:
                'A DC motor has a coil between magnetic poles, a split-ring commutator and two brushes. The selected structure is emphasised.',
            limitation: 'Structural teaching view only; no direction of motor force or rotation is inferred.',
            adaptation: 'Coil, poles and split-ring commutator. Use explicit question data and supported structural choices.',
            createdBatch: 'physics-completion',
            fieldDescriptions: { supplyVoltage: 'V', focusPart: '1: coil; 2: split-ring commutator; 3: brushes' }
        },
        'physics.generator.alternator': {
            title: 'Alternator structure',
            fields: { rotationRpm: [60, 3600, 600], focusPart: [1, 2, 2] },
            description:
                'An alternator has a rotating coil, two separate slip rings and brushes, with AC output. The supplied rotation rate is a given, not an inferred voltage.',
            limitation: 'Structural teaching view; output voltage is not inferred from rotation rate alone.',
            adaptation: 'Rotating coil and slip rings. Use explicit question data and supported structural choices.',
            createdBatch: 'physics-completion',
            fieldDescriptions: { rotationRpm: 'revolutions per minute', focusPart: '1: coil; 2: slip rings' }
        },
        'physics.optics.convex_lens': {
            title: 'Convex lens ray construction',
            fields: { focalLength: [3, 30, 10], objectDistance: [3, 120, 25], objectHeight: [0.5, 10, 4] },
            description:
                'A converging thin lens constructs an image from explicit object distance, height and focal length. Parallel and centre rays determine the image.',
            limitation: 'Thin-lens and paraxial approximation. Near-focus cases with unbounded image position are rejected.',
            adaptation: 'Focal distances determine real or virtual image. Use explicit question data and supported structural choices.',
            createdBatch: 'physics-completion',
            fieldDescriptions: {
                focalLength: 'cm; positive magnitude for either lens family',
                objectDistance: 'cm from lens',
                objectHeight: 'cm'
            }
        },
        'physics.optics.concave_lens': {
            title: 'Concave lens ray construction',
            fields: { focalLength: [3, 30, 10], objectDistance: [3, 120, 20], objectHeight: [0.5, 10, 4] },
            description: 'A diverging thin lens constructs a diminished virtual image. Dashed backward extensions meet on the object side.',
            limitation: 'Thin-lens and paraxial approximation; focal-length magnitude is supplied as a positive number.',
            adaptation: 'Diverging rays and virtual extensions. Use explicit question data and supported structural choices.',
            createdBatch: 'physics-completion',
            fieldDescriptions: {
                focalLength: 'cm; positive magnitude for either lens family',
                objectDistance: 'cm from lens',
                objectHeight: 'cm'
            }
        },
        'physics.optics.prism': {
            title: 'Prism dispersion',
            fields: { apexAngle: [45, 70, 60] },
            description:
                'A glass prism splits white light into an ordered visible spectrum. Violet deviates more than red in this qualitative schematic.',
            limitation: 'Dispersion angles and colours are schematic, not a numerical material-dispersion calculation.',
            adaptation: 'Ordered spectrum; schematic dispersion. Use explicit question data and supported structural choices.',
            createdBatch: 'physics-completion',
            fieldDescriptions: { apexAngle: 'degrees' }
        },
        'physics.sound.echo': {
            title: 'Echo distance geometry',
            fields: { soundSpeed: [250, 400, 340], givenKind: [1, 2, 1], givenValue: [0.01, 1e3, 50] },
            description:
                'Outward and reflected sound paths join a source/receiver and a reflecting wall. The given quantity is either one-way distance or round-trip time.',
            limitation: 'Bounded teaching schematic. Explicit givens are shown without a calculated answer or new assessment evidence.',
            adaptation: 'Outward and return paths; doubled travel distance. Use explicit question data and supported structural choices.',
            createdBatch: 'physics-completion',
            fieldDescriptions: {
                soundSpeed: 'metres per second',
                givenKind: '1: one-way distance in m; 2: round-trip time in s',
                givenValue: 'Value in the units selected by givenKind; do not derive or print the unknown quantity'
            }
        },
        'physics.pressure.hydraulic': {
            title: 'Hydraulic pistons',
            fields: { inputArea: [1, 100, 10], outputArea: [2, 800, 40], inputForce: [1, 1e3, 50] },
            description:
                'Two unequal-area pistons act on connected liquid at equal height. Input force and piston areas are given; output force is withheld.',
            limitation: 'Bounded teaching schematic. Explicit givens are shown without a calculated answer or new assessment evidence.',
            adaptation: 'Linked fluid and unequal piston areas. Use explicit question data and supported structural choices.',
            createdBatch: 'physics-completion',
            fieldDescriptions: { inputArea: 'cm\xB2', outputArea: 'cm\xB2', inputForce: 'N' }
        },
        'physics.pressure.fluid_depth': {
            title: 'Liquid pressure with depth',
            fields: { upperDepth: [0.1, 10, 2], lowerDepth: [0.2, 20, 6], density: [100, 2e3, 1e3] },
            description:
                'A liquid exerts forces normal to a container wall at two depths. The deeper arrow is longer for the same liquid density.',
            limitation: 'Bounded teaching schematic. Explicit givens are shown without a calculated answer or new assessment evidence.',
            adaptation: 'Pressure arrows normal to walls at explicit depths. Use explicit question data and supported structural choices.',
            createdBatch: 'physics-completion',
            fieldDescriptions: { upperDepth: 'metres below free surface', lowerDepth: 'metres below free surface', density: 'kg/m\xB3' }
        },
        'physics.force.action_reaction': {
            title: 'Action-reaction pair on separate objects',
            fields: { force: [0.1, 1e3, 20], interaction: [1, 2, 1] },
            description:
                'Two distinct objects experience equal and opposite interaction forces. The diagram shows either contact or repulsion between facing like magnetic poles.',
            limitation: 'Bounded teaching schematic. Explicit givens are shown without a calculated answer or new assessment evidence.',
            adaptation:
                'Two identified bodies; never sum forces across bodies. Use explicit question data and supported structural choices.',
            createdBatch: 'physics-completion',
            fieldDescriptions: { force: 'N on each of the two objects', interaction: '1: contact; 2: magnetic repulsion' },
            labels: {
                objectA: { match: 'Object A', example: 'Object A', maxLength: 12 },
                objectB: { match: 'Object B', example: 'Object B', maxLength: 12 }
            }
        },
        'physics.force.incline': {
            title: 'Inclined-plane force geometry',
            fields: { slopeAngle: [15, 40, 25], weight: [1, 1e3, 60], showFriction: [0, 1, 1] },
            description:
                'One object on a slope has weight vertically downward and a normal force perpendicular to the slope. Optional friction is upslope for a tendency to slide downward.',
            limitation:
                'Arrow lengths are illustrative when unknown force magnitudes are not supplied. Friction assumes a downward sliding tendency.',
            adaptation: 'One object, slope and normal force directions. Use explicit question data and supported structural choices.',
            createdBatch: 'physics-completion',
            fieldDescriptions: {
                slopeAngle: 'degrees above horizontal',
                weight: 'N',
                showFriction: 'An explicit bounded question quantity or approved choice.'
            }
        },
        'physics.force.centre_mass': {
            title: 'Centre-of-mass plumb-line construction',
            fields: { shape: [1, 2, 1], showIntersection: [0, 1, 1] },
            description:
                'Two recorded plumb-line traces are overlaid on a uniform lamina after separate suspensions. Their intersection locates its centre of mass.',
            limitation:
                'Traces are shown in the lamina\u2019s original orientation; each was vertical in a separate suspension. Uniform lamina assumed.',
            adaptation: 'Two suspension points and intersecting verticals. Use explicit question data and supported structural choices.',
            createdBatch: 'physics-completion',
            fieldDescriptions: {
                shape: '1: irregular pentagonal lamina; 2: triangular lamina',
                showIntersection: 'An explicit bounded question quantity or approved choice.'
            }
        },
        'physics.momentum.collision': {
            title: 'Collision before/after positions',
            fields: {
                massA: [0.1, 100, 1],
                massB: [0.1, 100, 1],
                beforeA: [-10, 10, 4],
                beforeB: [-10, 10, 0],
                afterA: [-10, 10, 0],
                afterB: [-10, 10, 4]
            },
            description:
                'Before and after velocities of two masses are supplied explicitly for an isolated collision. Positive velocity is to the right.',
            limitation: 'Bounded teaching schematic. Explicit givens are shown without a calculated answer or new assessment evidence.',
            adaptation:
                'Explicit object velocities and directions; no invented outcome. Use explicit question data and supported structural choices.',
            createdBatch: 'physics-completion',
            fieldDescriptions: {
                massA: 'kg',
                massB: 'kg',
                beforeA: 'm/s; positive right',
                beforeB: 'm/s; positive right',
                afterA: 'm/s; positive right',
                afterB: 'm/s; positive right'
            }
        },
        'physics.space.orbit': {
            title: 'Orbit and gravitational direction',
            fields: { radiusKm: [1e4, 1e6, 42e3], speedKms: [0.1, 30, 3], positionDegrees: [0, 315, 45], clockwise: [-1, 1, 1] },
            description:
                'A satellite in a circular orbit has inward gravitational force and tangential velocity. Its primary is unspecified.',
            limitation: 'No Earth-specific orbit or central mass is asserted. Radius and speed are supplied givens.',
            adaptation: 'Force towards primary; velocity tangential. Use explicit question data and supported structural choices.',
            createdBatch: 'physics-completion',
            fieldDescriptions: {
                radiusKm: 'km from the primary centre',
                speedKms: 'km/s tangentially',
                positionDegrees: 'orbital phase in degrees anticlockwise from the right-hand radius',
                clockwise: '1: clockwise; -1: anticlockwise'
            }
        },
        'physics.energy.rollercoaster': {
            title: 'Energy positions on a track',
            fields: { heightA: [3, 100, 20], heightB: [0, 30, 2], heightC: [3, 100, 12], mass: [10, 1e3, 300], carAt: [1, 3, 1] },
            description:
                'Three positions on a physical track have supplied heights above a common reference. One position carries a car of given mass.',
            limitation: 'The diagram does not assert that the car can reach every position without additional energy input.',
            adaptation:
                'Heights and motion positions; energy chart stays with Chart. Use explicit question data and supported structural choices.',
            createdBatch: 'physics-completion',
            fieldDescriptions: {
                heightA: 'm above reference',
                heightB: 'm above reference',
                heightC: 'm above reference',
                mass: 'kg',
                carAt: 'An explicit bounded question quantity or approved choice.'
            }
        },
        'physics.energy.falling_object': {
            title: 'Falling object and energy stores',
            fields: { initialHeight: [5, 100, 20], currentHeight: [0.5, 70, 5], speed: [0, 100, 12], mass: [0.1, 100, 2] },
            description:
                'A falling object is shown at its starting and current heights with supplied mass and current speed. No energy-conservation assumption is added.',
            limitation: 'Givens only: no friction-free or conservation-of-mechanical-energy assumption.',
            adaptation: 'Spatial heights, mass and speed givens. Use explicit question data and supported structural choices.',
            createdBatch: 'physics-completion',
            fieldDescriptions: { initialHeight: 'm', currentHeight: 'm', speed: 'm/s', mass: 'kg' }
        },
        'physics.thermal.conduction': {
            title: 'Thermal conduction model',
            fields: { leftTemperature: [-20, 100, 80], rightTemperature: [-20, 100, 20] },
            description:
                'A solid contains particles vibrating around fixed positions. Net energy transfers from the hotter end to the cooler end without bulk movement.',
            limitation: 'Bounded teaching schematic. Explicit givens are shown without a calculated answer or new assessment evidence.',
            adaptation: 'Energy transfer without bulk particle flow. Use explicit question data and supported structural choices.',
            createdBatch: 'physics-completion',
            fieldDescriptions: { leftTemperature: '\xB0C', rightTemperature: '\xB0C' }
        },
        'physics.thermal.convection': {
            title: 'Convection in a fluid',
            fields: { hotTemperature: [20, 90, 70], coolTemperature: [10, 80, 20], heaterSide: [-1, 1, -1] },
            description: 'Water heated on one side rises there and sinks on the cooler side. Arrows show a circulation pattern.',
            limitation: 'Qualitative water model above 10 \xB0C; not a fluid-dynamics simulation.',
            adaptation: 'Heating position and circulating fluid path. Use explicit question data and supported structural choices.',
            createdBatch: 'physics-completion',
            fieldDescriptions: { hotTemperature: '\xB0C', coolTemperature: '\xB0C', heaterSide: '-1: left; 1: right' }
        },
        'physics.energy.insulated_wall': {
            title: 'Insulated wall section',
            fields: {
                insideTemperature: [-20, 40, 20],
                outsideTemperature: [-30, 50, 5],
                insulationMm: [10, 200, 100],
                insulationType: [0, 2, 2]
            },
            description:
                'A layered wall separates inside and outside temperatures. A chosen air, foam or mineral-wool layer has supplied thickness; heat-transfer direction follows the temperature difference.',
            limitation: 'Bounded teaching schematic. Explicit givens are shown without a calculated answer or new assessment evidence.',
            adaptation:
                'Layers and thermal transfer paths; no invented U-values. Use explicit question data and supported structural choices.',
            createdBatch: 'physics-completion',
            fieldDescriptions: {
                insideTemperature: '\xB0C',
                outsideTemperature: '\xB0C',
                insulationMm: 'mm',
                insulationType: '0: air cavity; 1: foam; 2: mineral wool'
            }
        },
        'physics.thermal.specific_heat': {
            title: 'Specific-heat apparatus',
            fields: { massKg: [0.1, 5, 0.5], powerW: [1, 100, 50], timeSeconds: [30, 900, 120], riseC: [1, 80, 24] },
            description:
                'An insulated block contains a low-voltage heater and thermometer. Mass, power, time and measured temperature rise are supplied without a calculated specific heat capacity.',
            limitation: 'Bounded teaching schematic. Explicit givens are shown without a calculated answer or new assessment evidence.',
            adaptation: 'Block, heater, thermometer and insulation. Use explicit question data and supported structural choices.',
            createdBatch: 'physics-completion',
            fieldDescriptions: { massKg: 'kg', powerW: 'W', timeSeconds: 's', riseC: '\xB0C temperature rise' }
        },
        'physics.density.displacement': {
            title: 'Displacement-can density apparatus',
            fields: { massG: [1, 1e3, 120], volumeCm3: [10, 80, 40] },
            description:
                'A dense solid is fully submerged in a displacement can. Collected displaced water is read in a measuring cylinder; mass and displaced volume are given.',
            limitation: 'Bounded teaching schematic. Explicit givens are shown without a calculated answer or new assessment evidence.',
            adaptation: 'Collected displaced liquid and measured solid. Use explicit question data and supported structural choices.',
            createdBatch: 'physics-completion',
            fieldDescriptions: { massG: 'g', volumeCm3: 'cm\xB3 of water displaced' }
        },
        'physics.nuclear.fission': {
            title: 'Fission event geometry',
            fields: { channel: [1, 2, 1] },
            description:
                'An incident neutron is absorbed by uranium-235. An approved illustrative channel yields two smaller nuclei and three neutrons; nucleon and proton numbers balance.',
            limitation: 'Illustrative balanced channels only, not predictions of fragment yields or a reactor design.',
            adaptation:
                'Nuclear fragments, emitted neutrons and conservation checks. Use explicit question data and supported structural choices.',
            createdBatch: 'physics-completion',
            fieldDescriptions: { channel: '1: U-235+n to Ba-141+Kr-92+3n; 2: U-235+n to Ba-144+Kr-89+3n. Illustrative channels only.' }
        },
        'physics.nuclear.fusion': {
            title: 'Fusion event geometry',
            fields: { channel: [1, 2, 1], showKey: [0, 1, 1] },
            description:
                'Two light hydrogen nuclei form a helium nucleus and a neutron in one approved reaction channel. Particle colours distinguish protons and neutrons when the key is shown.',
            limitation: 'One allowed channel is selected; other possible branches are not implied absent. Not an engineering model.',
            adaptation:
                'Light nuclei combine; conservation checks and no orbit analogy. Use explicit question data and supported structural choices.',
            createdBatch: 'physics-completion',
            fieldDescriptions: {
                channel: '1: H-2+H-3 to He-4+n; 2: H-2+H-2 to He-3+n',
                showKey: 'An explicit bounded question quantity or approved choice.'
            }
        },
        'physics.electrostatic.point_field': {
            title: 'Electric field around a charge',
            fields: { sign: [-1, 1, 1], chargeMicroC: [0.1, 100, 2] },
            description:
                'Radial electric-field arrows point away from a positive charge or towards a negative charge. They show the force direction on a positive test charge.',
            limitation: 'Bounded teaching schematic. Explicit givens are shown without a calculated answer or new assessment evidence.',
            adaptation:
                'Radial field with sign-dependent direction; separate-physics review. Use explicit question data and supported structural choices.',
            createdBatch: 'physics-completion',
            fieldDescriptions: { sign: '1: positive; -1: negative', chargeMicroC: 'magnitude in microcoulombs' }
        },
        'chemistry.apparatus.water_displacement': {
            title: 'Gas collection over water',
            fields: { gasMl: [5, 90, 40] },
            description: 'An inverted water-filled collector receives gas through a delivery tube whose outlet remains submerged.',
            limitation:
                'Use only for gases sufficiently insoluble in water. The free liquid surfaces are schematic, not pressure measurements.',
            adaptation:
                'Inverted vessel and submerged delivery tube. Use supplied question data and the declared structural choices; do not invent absent givens.',
            createdBatch: 'chemistry-completion',
            fieldDescriptions: { gasMl: 'gas in mL' }
        },
        'chemistry.apparatus.crystallisation': {
            title: 'Evaporation and crystallisation apparatus',
            fields: { stage: [1, 2, 1], solutionMl: [5, 200, 50], crystals: [0, 8, 0] },
            description:
                'A basin holds solution in a water bath; the approved cooling view includes explicitly selected schematic crystals.',
            limitation: 'The two stages are separate views. Crystal marks are not a measured yield.',
            adaptation:
                'Water bath and evaporating basin. Use supplied question data and the declared structural choices; do not invent absent givens.',
            createdBatch: 'chemistry-completion',
            fieldDescriptions: {
                stage: '1: evaporation in a water bath; 2: cooling concentrated solution',
                solutionMl: 'solution in mL',
                crystals: 'crystals'
            },
            labels: { solutionLabel: { match: 'Solution', example: 'Salt solution', maxLength: 18 } }
        },
        'chemistry.apparatus.fractionation': {
            title: 'Fractionating column',
            fields: { topC: [10, 150, 40], baseC: [250, 450, 350], focusOutlet: [1, 5, 2] },
            description: 'A fractionating column is cooler at the top, with selected outlets ordered from lighter to heavier fractions.',
            limitation: 'Five simplified fraction groups; temperatures are supplied examples, not fixed universal boiling points.',
            adaptation:
                'Temperature gradient and outlet order. Use supplied question data and the declared structural choices; do not invent absent givens.',
            createdBatch: 'chemistry-completion',
            fieldDescriptions: {
                topC: 'top in \xB0C',
                baseC: 'base in \xB0C',
                focusOutlet: '1 refinery gas; 2 petrol; 3 kerosene; 4 diesel; 5 heavy residue'
            }
        },
        'chemistry.apparatus.separating_funnel': {
            title: 'Separating funnel',
            fields: { lowerFraction: [20, 75, 40] },
            description: 'Two supplied immiscible liquids occupy separate layers above a tap and open receiver.',
            limitation: 'The lower layer is denser. Percentages are explicit givens; vessel geometry is schematic.',
            adaptation:
                'Immiscible layers, stopcock and receiver. Use supplied question data and the declared structural choices; do not invent absent givens.',
            createdBatch: 'chemistry-completion',
            fieldDescriptions: { lowerFraction: 'Given lower-layer percentage, 20\u201375; schematic fill proportion.' },
            labels: {
                upperLabel: { match: 'Upper layer', example: 'Oil', maxLength: 15 },
                lowerLabel: { match: 'Lower layer', example: 'Water', maxLength: 15 }
            }
        },
        'chemistry.apparatus.reflux': {
            title: 'Reflux apparatus',
            fields: { liquidMl: [5, 250, 50], minutes: [1, 180, 20] },
            description: 'A vertical condenser returns condensed liquid to a heated flask and stays open to the atmosphere.',
            limitation: 'Apparatus interpretation only. Supplied time and volume do not imply a reaction recipe or yield.',
            adaptation:
                'Vertical condenser returns condensate; distinct from distillation. Use supplied question data and the declared structural choices; do not invent absent givens.',
            createdBatch: 'chemistry-completion',
            fieldDescriptions: { liquidMl: 'liquid in mL', minutes: 'minutes' }
        },
        'chemistry.apparatus.calorimeter': {
            title: 'Insulated-cup calorimeter',
            fields: { initialC: [5, 90, 20], finalC: [5, 90, 35], solutionMl: [5, 250, 50] },
            description: 'An insulated cup, lid, thermometer and stirrer support a supplied temperature-change observation.',
            limitation: 'No heat capacity, density or heat loss is assumed. Do not infer reaction enthalpy from the picture.',
            adaptation:
                'Cup, lid and thermometer geometry. Use supplied question data and the declared structural choices; do not invent absent givens.',
            createdBatch: 'chemistry-completion',
            fieldDescriptions: { initialC: 'initial in \xB0C', finalC: 'final in \xB0C', solutionMl: 'solution in mL' }
        },
        'chemistry.apparatus.balance_closed': {
            title: 'Closed-system mass experiment',
            fields: { massG: [1, 9999, 125.4], gasMl: [20, 200, 100] },
            description: 'Before and after views show the same closed assembly on a balance; evolved gas is retained in a balloon.',
            limitation:
                'Total mass remains constant in this closed-system model. Balloon dimensions are schematic; gas volume is an explicit supplied observation.',
            adaptation:
                'Gas retained in sealed assembly; balance readings explicit. Use supplied question data and the declared structural choices; do not invent absent givens.',
            createdBatch: 'chemistry-completion',
            fieldDescriptions: { massG: 'mass in g', gasMl: 'Supplied evolved gas volume in mL; drawing is schematic.' }
        },
        'chemistry.apparatus.meniscus': {
            title: 'Meniscus reading geometry',
            fields: { lowerMl: [0, 90, 20], upperMl: [10, 100, 30], readingMl: [0, 100, 26] },
            description: 'The eye is level with the bottom of a concave meniscus on an ascending cylinder scale.',
            limitation: 'Concave meniscus only; unsuitable for mercury or a descending burette scale.',
            adaptation:
                'Eye level, curved liquid surface and supplied scale. Use supplied question data and the declared structural choices; do not invent absent givens.',
            createdBatch: 'chemistry-completion',
            fieldDescriptions: { lowerMl: 'lower in mL', upperMl: 'upper in mL', readingMl: 'reading in mL' }
        },
        'chemistry.apparatus.volumetric_flask': {
            title: 'Volumetric-flask calibration',
            fields: { capacityMl: [25, 1e3, 250], calibrationC: [15, 25, 20], fillState: [-1, 1, 0] },
            description: 'A single calibration mark aligns with the bottom of the meniscus in a volumetric flask.',
            limitation: 'Correct, overfilled and underfilled structural examples; no concentration calculation is implied.',
            adaptation:
                'Calibration mark and meniscus alignment. Use supplied question data and the declared structural choices; do not invent absent givens.',
            createdBatch: 'chemistry-completion',
            fieldDescriptions: {
                capacityMl: 'capacity in mL',
                calibrationC: 'calibration in \xB0C',
                fillState: '-1 overfilled; 0 aligned; 1 underfilled'
            }
        },
        'chemistry.apparatus.pipette': {
            title: 'Volumetric pipette and filler',
            fields: { capacityMl: [5, 50, 25], fillState: [-1, 1, 0] },
            description: 'A pipette filler, calibration mark, central bulb and narrow outlet identify a volumetric pipette.',
            limitation: 'Filler shown; no mouth pipetting. Calibration offset is a qualitative teaching choice.',
            adaptation:
                'Bulb, mark and filler; never mouth pipetting. Use supplied question data and the declared structural choices; do not invent absent givens.',
            createdBatch: 'chemistry-completion',
            fieldDescriptions: { capacityMl: 'capacity in mL', fillState: '-1 overfilled; 0 aligned; 1 underfilled' }
        },
        'chemistry.bonding.ionic_lattice': {
            title: 'Ionic crystal lattice',
            fields: { salt: [1, 3, 1], columns: [3, 6, 5] },
            description: 'Alternating cations and anions form a bounded slice of a giant ionic crystal.',
            limitation: 'A schematic slice, not an isolated molecule. Only approved one-to-one salts are supported.',
            adaptation:
                'Alternating ions in a slice of a 3D lattice. Use supplied question data and the declared structural choices; do not invent absent givens.',
            createdBatch: 'chemistry-completion',
            fieldDescriptions: { salt: '1 sodium chloride; 2 magnesium oxide; 3 potassium bromide', columns: 'columns' }
        },
        'chemistry.structure.diamond': {
            title: 'Diamond network',
            fields: { showNeighbours: [0, 1, 1], highlightBond: [1, 4, 1] },
            description: 'A projected local diamond network shows four tetrahedral bonds around the central carbon.',
            limitation: 'Boundary atoms are a truncated fragment; projected angles are not actual bond angles.',
            adaptation:
                'Tetrahedral bonding; molecular renderer if editable. Use supplied question data and the declared structural choices; do not invent absent givens.',
            createdBatch: 'chemistry-completion',
            fieldDescriptions: { showNeighbours: 'showNeighbours', highlightBond: 'highlightBond' }
        },
        'chemistry.structure.graphite': {
            title: 'Graphite layers',
            fields: { layers: [2, 3, 3], sliding: [0, 1, 0], highlightLayer: [1, 3, 2] },
            description: 'Stacked hexagonal carbon sheets have strong in-layer bonds and weaker interlayer attractions.',
            limitation: 'Cropped projected layers; no covalent bonds are drawn between sheets.',
            adaptation:
                'Three bonds per carbon and layer structure. Use supplied question data and the declared structural choices; do not invent absent givens.',
            createdBatch: 'chemistry-completion',
            fieldDescriptions: { layers: 'layers', sliding: 'sliding', highlightLayer: 'highlightLayer' }
        },
        'chemistry.structure.graphene': {
            title: 'Graphene sheet',
            fields: { columns: [2, 5, 4], showElectrons: [0, 1, 0] },
            description: 'A single honeycomb carbon layer gives each interior atom three bonded neighbours.',
            limitation: 'The fragment is cropped. Electron dots are qualitative and are not an electron-counting exercise.',
            adaptation:
                'Single hexagonal carbon sheet. Use supplied question data and the declared structural choices; do not invent absent givens.',
            createdBatch: 'chemistry-completion',
            fieldDescriptions: { columns: 'columns', showElectrons: 'showElectrons' }
        },
        'chemistry.structure.polymer_packing': {
            title: 'Polymer packing',
            fields: { chains: [3, 5, 4], branching: [0, 1, 0], crosslinks: [0, 1, 0] },
            description: 'Illustrative polymer chains can have selected branches or cross-links.',
            limitation: 'A packing model, not a repeat-unit structure or a prediction of a named polymer property.',
            adaptation:
                'Entangled chains; molecular structures stay with SMILES. Use supplied question data and the declared structural choices; do not invent absent givens.',
            createdBatch: 'chemistry-completion',
            fieldDescriptions: { chains: 'chains', branching: 'branching', crosslinks: 'crosslinks' }
        },
        'chemistry.material.alloy': {
            title: 'Alloy lattice distortion',
            fields: { addedAtoms: [1, 4, 2], sizeRatio: [1.15, 1.45, 1.3] },
            description: 'Different-sized added atoms disrupt a regular metal layer in an illustrative alloy fragment.',
            limitation: 'Not a composition measurement, phase diagram or prediction of a particular alloy.',
            adaptation:
                'Different-sized atoms disrupt layers; no new molecular renderer. Use supplied question data and the declared structural choices; do not invent absent givens.',
            createdBatch: 'chemistry-completion',
            fieldDescriptions: { addedAtoms: 'addedAtoms', sizeRatio: 'sizeRatio' }
        },
        'chemistry.reaction.collision': {
            title: 'Effective collision model',
            fields: { energy: [1, 200, 60], activation: [1, 200, 50], orientation: [1, 2, 1], showOutcome: [0, 1, 1] },
            description: 'A generic collision requires both sufficient energy and a compatible orientation in this simplified model.',
            limitation: 'Not a molecular mechanism; particle symbols and orientation are illustrative. Energies use a molar scale.',
            adaptation:
                'Orientation and threshold energy stated. Use supplied question data and the declared structural choices; do not invent absent givens.',
            createdBatch: 'chemistry-completion',
            fieldDescriptions: {
                energy: 'Given molar collision-energy scale in kJ/mol',
                activation: 'Given activation-energy scale in kJ/mol',
                orientation: '1 compatible; 2 incompatible in this declared simplified model',
                showOutcome: 'showOutcome'
            },
            labels: {
                reactantA: { match: 'Reactant A', example: 'Reactant A', maxLength: 16 },
                reactantB: { match: 'Reactant B', example: 'Reactant B', maxLength: 16 }
            }
        },
        'chemistry.reaction.catalyst_surface': {
            title: 'Surface catalysis model',
            fields: { occupiedSites: [1, 4, 2], temperatureC: [10, 500, 100] },
            description: 'Some reactants adsorb at illustrative surface sites while others approach the surface.',
            limitation: 'No reaction mechanism, bond breaking or named catalyst activity is inferred.',
            adaptation:
                'Adsorption schematic; no unsupported mechanism. Use supplied question data and the declared structural choices; do not invent absent givens.',
            createdBatch: 'chemistry-completion',
            fieldDescriptions: { occupiedSites: 'occupiedSites', temperatureC: 'temperature in \xB0C' },
            labels: { catalystLabel: { match: 'Catalyst', example: 'Catalyst A', maxLength: 18 } }
        },
        'chemistry.particle.dissolving': {
            title: 'Dissolving ionic solid',
            fields: { pairs: [3, 6, 6] },
            description: 'Equal counts of positive and negative monovalent ions change from a solid fragment to dispersed aqueous ions.',
            limitation: 'Water molecules and hydration shells are omitted. Approved one-to-one monovalent-ion model only.',
            adaptation:
                'Dissociated ions; conserve counts. Use supplied question data and the declared structural choices; do not invent absent givens.',
            createdBatch: 'chemistry-completion',
            fieldDescriptions: { pairs: 'pairs' }
        },
        'chemistry.particle.diffusion': {
            title: 'Diffusion of a gas',
            fields: { particles: [6, 18, 12], temperatureC: [0, 80, 20] },
            description: 'The same number of gas particles spread through a container after a partition is removed.',
            limitation: 'Particle positions are illustrative snapshots, not trajectories or an exact rate simulation.',
            adaptation:
                'Conserved particles and concentration difference. Use supplied question data and the declared structural choices; do not invent absent givens.',
            createdBatch: 'chemistry-completion',
            fieldDescriptions: { particles: 'particles', temperatureC: 'temperature in \xB0C' }
        },
        'chemistry.particle.conservation': {
            title: 'Conservation-of-atoms particle model',
            fields: { units: [1, 4, 3] },
            description: 'A generic A\u2082 plus B atom-accounting model rearranges into A\u2082B while conserving each atom type.',
            limitation: 'Abstract stoichiometric counters, not a claim that a particular chemical reaction occurs.',
            adaptation:
                'Counts preserved before/after rearrangement; structures use SMILES. Use supplied question data and the declared structural choices; do not invent absent givens.',
            createdBatch: 'chemistry-completion',
            fieldDescriptions: { units: 'units' }
        },
        'chemistry.particle.surface_area': {
            title: 'Solid subdivision and exposed area',
            fields: { sideCm: [0.1, 100, 6], divisions: [2, 3, 2] },
            description: 'One cube is subdivided into equal smaller cubes shown separately, conserving total volume.',
            limitation: 'All small cube faces are exposed in the separated model. Surface areas are calculated independently.',
            adaptation:
                'Equal total volume; differing exposed faces. Use supplied question data and the declared structural choices; do not invent absent givens.',
            createdBatch: 'chemistry-completion',
            fieldDescriptions: { sideCm: 'side in cm', divisions: 'divisions' }
        },
        'chemistry.environment.greenhouse': {
            title: 'Greenhouse radiation paths',
            fields: { gas: [1, 3, 1], showReflection: [0, 1, 0] },
            description:
                'Incoming solar radiation and outgoing infrared follow distinct paths; greenhouse gases absorb and re-emit infrared.',
            limitation: 'Qualitative energy-path geometry, not a spectral or energy-budget chart.',
            adaptation:
                'Separate incoming solar and outgoing thermal radiation. Use supplied question data and the declared structural choices; do not invent absent givens.',
            createdBatch: 'chemistry-completion',
            fieldDescriptions: { gas: '1 carbon dioxide; 2 methane; 3 water vapour', showReflection: 'showReflection' }
        },
        'chemistry.resource.water_filter': {
            title: 'Water-treatment filter section',
            fields: { sandCm: [10, 150, 60], gravelCm: [5, 60, 20] },
            description: 'Water passes down through sand and supporting gravel before leaving through a lower outlet.',
            limitation: 'A filter section only; separate disinfection is needed for potable water.',
            adaptation:
                'Sand/gravel beds; sterilisation remains separate. Use supplied question data and the declared structural choices; do not invent absent givens.',
            createdBatch: 'chemistry-completion',
            fieldDescriptions: { sandCm: 'sand in cm', gravelCm: 'gravel in cm' }
        },
        'chemistry.atom.isotopes': {
            title: 'Isotope nuclei comparison',
            fields: { atomicNumber: [1, 17, 6], leftMass: [1, 37, 12], rightMass: [1, 37, 14] },
            description: 'Two isotope nuclei have the same proton count but different neutron counts.',
            limitation: 'Nuclei are schematic clusters, not spatial nuclear models. Only listed common isotope pairs are supported.',
            adaptation:
                'Same proton count, different neutron count. Use supplied question data and the declared structural choices; do not invent absent givens.',
            createdBatch: 'chemistry-completion',
            fieldDescriptions: { atomicNumber: 'atomicNumber', leftMass: 'leftMass', rightMass: 'rightMass' }
        },
        'chemistry.apparatus.bunsen': {
            title: 'Bunsen burner cutaway',
            fields: { airHoleOpen: [0, 1, 1] },
            description: 'A burner cutaway identifies the barrel, collar, gas inlet and a schematic flame condition.',
            limitation: 'An educational apparatus illustration, not operational instructions or a calibrated flame-temperature model.',
            adaptation:
                'Barrel, gas inlet, air hole and collar; no operating instructions. Use supplied question data and the declared structural choices; do not invent absent givens.',
            createdBatch: 'chemistry-completion',
            fieldDescriptions: { airHoleOpen: 'airHoleOpen' }
        },
        'chemistry.apparatus.electrolysis': {
            title: 'Electrolysis cell',
            fields: { voltage: [1, 12, 6], cathodeSide: [-1, 1, -1], ionPairs: [2, 3, 3] },
            description:
                'A DC source fixes electrode polarity; positive ions move towards the cathode and negative ions towards the anode.',
            limitation: 'Generic electrolyte model. Products depend on electrolyte and conditions and are not guessed.',
            adaptation:
                'Polarity, electrodes and electrolyte explicit. Use supplied question data and the declared structural choices; do not invent absent givens.',
            createdBatch: 'chemistry-completion',
            fieldDescriptions: {
                voltage: 'voltage',
                cathodeSide: '-1 left; 1 right; positive ions move to this negative electrode',
                ionPairs: 'ionPairs'
            }
        },
        'chemistry.analysis.flame_test': {
            title: 'Flame-test observation plate',
            fields: { observedColour: [1, 5, 2] },
            description: 'A clean wire loop holds a sample in a schematic flame with an explicitly supplied colour observation.',
            limitation: 'Colours vary between displays. No ion identity is inferred from the illustration.',
            adaptation:
                'Explicit colour observations; schematic not identification evidence. Use supplied question data and the declared structural choices; do not invent absent givens.',
            createdBatch: 'chemistry-completion',
            fieldDescriptions: { observedColour: '1 crimson; 2 yellow; 3 lilac; 4 orange-red; 5 green' },
            labels: { sampleLabel: { match: 'Sample', example: 'Unknown X', maxLength: 16 } }
        },
        'chemistry.analysis.gas_test': {
            title: 'Gas-test apparatus',
            fields: { testKind: [1, 3, 1], sampleNumber: [1, 99, 1] },
            description: 'An approved burning-splint, glowing-splint or limewater test layout leaves the observation for the learner.',
            limitation: 'No gas identity or test outcome is disclosed. The diagram is not an instruction to test unknown hazards.',
            adaptation:
                'Approved gas test layouts with observation withheld. Use supplied question data and the declared structural choices; do not invent absent givens.',
            createdBatch: 'chemistry-completion',
            fieldDescriptions: {
                testKind: '1 burning splint at tube mouth; 2 glowing splint inside tube; 3 gas bubbled through limewater',
                sampleNumber: 'sampleNumber'
            },
            labels: { sampleLabel: { match: 'Sample gas', example: 'Gas X', maxLength: 16 } }
        },
        'biology.cell.microscope': {
            title: 'Light microscope',
            fields: { eyepiece: [5, 15, 10], objective: [4, 40, 10], focusPart: [1, 4, 2] },
            description:
                'An optical microscope shows the eyepiece, objective, stage and focus control; the supplied lens powers remain explicit.',
            limitation: 'Optical magnification only. Total magnification is left for the learner; no resolution is inferred.',
            adaptation:
                'Optics, stage and coarse/fine focus. Select approved structures and use supplied observations only; do not invent absent measurements.',
            createdBatch: 'biology-completion',
            fieldDescriptions: {
                eyepiece: 'eyepiece',
                objective: 'objective',
                focusPart: 'Highlight 1 eyepiece; 2 objective; 3 stage; 4 focus control.'
            }
        },
        'biology.cell.mitosis': {
            title: 'Mitosis spatial stages',
            fields: { stage: [1, 3, 1], chromosomes: [2, 6, 4] },
            description:
                'A single mitotic snapshot shows replicated chromosomes at the equator, separated chromatids, or forming daughter nuclei.',
            limitation:
                'Generic diploid cell, not a human chromosome count. This is a spatial snapshot; use Stepper for a process sequence.',
            adaptation:
                'Chromosomes, spindle and two daughter nuclei. Select approved structures and use supplied observations only; do not invent absent measurements.',
            createdBatch: 'biology-completion',
            fieldDescriptions: {
                stage: '1 metaphase; 2 anaphase; 3 telophase with cytokinesis.',
                chromosomes: 'Number of chromosomes in the original diploid model; each daughter receives that number.'
            }
        },
        'biology.cell.sperm': {
            title: 'Sperm-cell specialisation',
            fields: { focusPart: [1, 4, 2], tailBend: [-1, 1, 1], lengthUm: [40, 80, 55] },
            description: 'A mammalian sperm cell has an acrosome, nucleus, mitochondria-rich midpiece and flagellum.',
            limitation: 'Simplified side view. Length is a supplied measurement, not a universal size.',
            adaptation:
                'Head, midpiece and flagellum; not to scale. Select approved structures and use supplied observations only; do not invent absent measurements.',
            createdBatch: 'biology-completion',
            fieldDescriptions: {
                focusPart: 'Highlight 1 acrosome/head; 2 nucleus; 3 midpiece; 4 flagellum.',
                tailBend: 'Approved flagellum bend: -1 or 1.',
                lengthUm: 'Given total length in micrometres.'
            }
        },
        'biology.cell.red_blood': {
            title: 'Red blood cell structure',
            fields: { diameterUm: [5, 9.5, 7.5], focusPart: [1, 2, 1] },
            description: 'A mature human red blood cell is shown face-on and in a biconcave section; no nucleus is drawn.',
            limitation: 'Illustrative healthy-cell shape; supplied diameter does not determine a medical condition.',
            adaptation:
                'Biconcave shape and absence of nucleus in mature human cell. Select approved structures and use supplied observations only; do not invent absent measurements.',
            createdBatch: 'biology-completion',
            fieldDescriptions: { diameterUm: 'diameterUm', focusPart: '1 central thin region; 2 biconcave section.' }
        },
        'biology.cell.ciliated': {
            title: 'Ciliated epithelial surface',
            fields: { cells: [3, 6, 4], particles: [0, 8, 5], mucusDirection: [-1, 1, 1] },
            description: 'Selected airway epithelial cells bear cilia beneath mucus, with a direction towards the throat.',
            limitation: 'Particle marks are qualitative examples, not a measured concentration or complete tissue sample.',
            adaptation:
                'Cilia, mucus and particle movement. Select approved structures and use supplied observations only; do not invent absent measurements.',
            createdBatch: 'biology-completion',
            fieldDescriptions: {
                cells: 'cells',
                particles: 'Number of selected illustrative trapped particles.',
                mucusDirection: '-1 movement towards throat drawn left; 1 drawn right.'
            }
        },
        'biology.cell.yeast': {
            title: 'Yeast cell and budding',
            fields: { budStage: [0, 2, 1], focusPart: [1, 4, 2] },
            description: 'A yeast cell has a wall, membrane, nucleus and vacuole, with an optional early or late bud.',
            limitation: 'Selected structures of a budding yeast; a schematic snapshot rather than a timed life-cycle model.',
            adaptation:
                'Eukaryotic microbe; budding structure. Select approved structures and use supplied observations only; do not invent absent measurements.',
            createdBatch: 'biology-completion',
            fieldDescriptions: {
                budStage: '0 no bud; 1 early bud before daughter nucleus; 2 late bud with daughter nucleus.',
                focusPart: '1 wall; 2 nucleus; 3 vacuole; 4 bud.'
            }
        },
        'biology.plant.transport_tissues': {
            title: 'Xylem and phloem sections',
            fields: { sugarDirection: [-1, 1, 1] },
            description:
                'Xylem has a continuous lignified water pathway; phloem has sieve plates and a companion cell, with a selected source-to-sink direction.',
            limitation: 'Phloem transport may run in either direction in different tubes; this drawing shows one source-to-sink pathway.',
            adaptation:
                'Lignification, sieve plates and companion cells. Select approved structures and use supplied observations only; do not invent absent measurements.',
            createdBatch: 'biology-completion',
            fieldDescriptions: { sugarDirection: '1 source above sink; -1 source below sink.' }
        },
        'biology.plant.potometer': {
            title: 'Potometer apparatus',
            fields: { displacementMm: [0, 150, 60], seconds: [10, 600, 120] },
            description:
                'A shoot joins a sealed water-filled capillary, air bubble and reset reservoir; the scale shows supplied bubble displacement.',
            limitation:
                'Measures water uptake as a proxy, not transpiration directly. A rate requires dimensions and suitable controlled conditions.',
            adaptation:
                'Water uptake as proxy; bubble and capillary positions. Select approved structures and use supplied observations only; do not invent absent measurements.',
            createdBatch: 'biology-completion',
            fieldDescriptions: {
                displacementMm: 'Given left-edge displacement towards the shoot from the right-hand zero scale mark, in mm.',
                seconds: 'Given observation interval in seconds.'
            }
        },
        'biology.plant.photosynthesis_apparatus': {
            title: 'Aquatic plant photosynthesis apparatus',
            fields: { distanceCm: [5, 100, 20], bubbleMarks: [0, 4, 3] },
            description: 'A lamp illuminates pondweed beneath a funnel and inverted water-filled gas collector.',
            limitation: 'Distance is a supplied value. Bubble marks are illustrative; they are not a measured oxygen rate.',
            adaptation:
                'Light distance and oxygen collection; rate graph uses Chart. Select approved structures and use supplied observations only; do not invent absent measurements.',
            createdBatch: 'biology-completion',
            fieldDescriptions: {
                distanceCm: 'Supplied lamp-to-vessel distance in cm; schematic layout.',
                bubbleMarks: 'Selected gas-bubble marks only; not bubbles per minute.'
            }
        },
        'biology.plant.stem_section': {
            title: 'Stem vascular arrangement',
            fields: { bundles: [6, 10, 8], focusTissue: [1, 3, 1] },
            description:
                'A young dicot stem cross-section shows a ring of vascular bundles with xylem inward, phloem outward and central pith.',
            limitation: 'Representative young dicot model; bundle count is illustrative and does not identify a species.',
            adaptation:
                'Xylem/phloem positions in a named simplified stem model. Select approved structures and use supplied observations only; do not invent absent measurements.',
            createdBatch: 'biology-completion',
            fieldDescriptions: { bundles: 'bundles', focusTissue: '1 xylem; 2 phloem; 3 pith.' }
        },
        'biology.organ.heart': {
            title: 'Heart cross-section',
            fields: { focusCircuit: [1, 2, 1], showValves: [0, 1, 1] },
            description: 'A four-chamber heart separates pulmonary and systemic pathways and shows the thicker left ventricular wall.',
            limitation:
                'Anatomical right is on the viewer\u2019s left. Schematic paths are separated for readability, not a surgical anatomical reconstruction.',
            adaptation:
                'Chambers, valves and pulmonary/systemic vessels. Select approved structures and use supplied observations only; do not invent absent measurements.',
            createdBatch: 'biology-completion',
            fieldDescriptions: {
                focusCircuit: '1 highlight right-heart pulmonary pump; 2 left-heart systemic pump.',
                showValves: '1 show the four valve symbols; 0 omit valve detail without changing flow.'
            }
        },
        'biology.organ.digestive': {
            title: 'Digestive tract',
            fields: { focusPart: [1, 5, 2] },
            description:
                'A continuous digestive tract runs through oesophagus, stomach, small and large intestine to the rectum; liver and pancreas are adjacent accessory organs.',
            limitation: 'Simplified organ positions; selected structures only. Accessory organs are not part of the food pathway.',
            adaptation:
                'Organ position and continuous alimentary canal. Select approved structures and use supplied observations only; do not invent absent measurements.',
            createdBatch: 'biology-completion',
            fieldDescriptions: { focusPart: '1 oesophagus/stomach; 2 small intestine; 3 large intestine; 4 liver; 5 pancreas.' }
        },
        'biology.organ.eye': {
            title: 'Eye cross-section',
            fields: { nearFocus: [0, 1, 1], showRays: [0, 1, 1] },
            description:
                'An eye section shows cornea, iris, lens, retina and optic nerve; accommodation selects a thicker near-focus or thinner distant-focus lens.',
            limitation:
                'Qualitative optical rays only. Use JSXGraph or the optics renderer for quantitative ray construction; no sight defect is inferred.',
            adaptation:
                'Cornea, iris, lens, retina and optic nerve. Select approved structures and use supplied observations only; do not invent absent measurements.',
            createdBatch: 'biology-completion',
            fieldDescriptions: { nearFocus: 'nearFocus', showRays: 'showRays' }
        },
        'biology.organ.kidney': {
            title: 'Kidney cross-section',
            fields: { focusPart: [1, 3, 1] },
            description: 'A kidney longitudinal section distinguishes outer cortex, medullary pyramids, renal pelvis, vessels and ureter.',
            limitation:
                'Textbook enrichment when appropriate: AQA GCSE does not require kidney anatomy. Check the trusted board and course; do not imply it is compulsory GCSE content.',
            adaptation:
                'Cortex, medulla, pelvis and ureter. Select approved structures and use supplied observations only; do not invent absent measurements.',
            createdBatch: 'biology-completion',
            fieldDescriptions: { focusPart: '1 cortex; 2 medulla; 3 renal pelvis and ureter.' }
        },
        'biology.organ.nephron': {
            title: 'Nephron and capillary anatomy',
            fields: { focusRegion: [1, 3, 1] },
            description:
                'A nephron schematic places the glomerulus and convoluted tubules in the cortex, a loop extending into medulla and a collecting duct.',
            limitation:
                'Textbook enrichment: detailed nephron anatomy is not required by AQA GCSE. Only selected flow and reabsorption locations are shown; check curriculum applicability.',
            adaptation:
                'Textbook filtration/reabsorption anatomy; not required by AQA GCSE. Select approved structures and use supplied observations only; do not invent absent measurements.',
            createdBatch: 'biology-completion',
            fieldDescriptions: { focusRegion: '1 renal corpuscle; 2 tubule and loop; 3 collecting duct.' }
        },
        'biology.membrane.osmosis': {
            title: 'Osmosis across a membrane',
            fields: { leftSolute: [0, 9, 3], rightSolute: [0, 9, 7] },
            description:
                'Two equal-volume solutions are separated by a membrane permeable to water but not solute; net water movement follows the supplied relative solute amounts.',
            limitation:
                'Assumes equal pressure and comparable solute. The dots represent relative solute units, not individual dissolved molecules.',
            adaptation:
                'Selectively permeable membrane; water potential model. Select approved structures and use supplied observations only; do not invent absent measurements.',
            createdBatch: 'biology-completion',
            fieldDescriptions: { leftSolute: 'leftSolute', rightSolute: 'rightSolute' }
        },
        'biology.membrane.active_transport': {
            title: 'Membrane pump model',
            fields: { outside: [1, 4, 2], inside: [2, 9, 6] },
            description:
                'A carrier takes ions from a lower outside concentration to a higher inside concentration using energy from respiration.',
            limitation:
                'Equal-volume qualitative concentration model of selected active uptake; not a claim about every transport mechanism.',
            adaptation:
                'Transport against concentration gradient with energy. Select approved structures and use supplied observations only; do not invent absent measurements.',
            createdBatch: 'biology-completion',
            fieldDescriptions: { outside: 'outside', inside: 'inside' }
        },
        'biology.enzyme.active_site': {
            title: 'Enzyme-substrate fit',
            fields: { substrateShape: [1, 2, 1], state: [0, 2, 0] },
            description: 'An enzyme has a complementary active-site shape and a supplied free, bound or denatured state.',
            limitation: 'Lock-and-key shape analogy only; real enzyme structure is three-dimensional and may change on binding.',
            adaptation:
                'Specific active site and substrate geometry. Select approved structures and use supplied observations only; do not invent absent measurements.',
            createdBatch: 'biology-completion',
            fieldDescriptions: {
                substrateShape: 'Approved symbolic substrate: 1 triangular; 2 rectangular.',
                state: '0 free substrate; 1 bound substrate; 2 denatured enzyme with non-matching site.'
            }
        },
        'biology.immune.phagocyte': {
            title: 'Phagocytosis spatial model',
            fields: { bacteria: [1, 4, 2], focusPart: [1, 2, 2] },
            description: 'A phagocyte contains engulfed bacteria in a phagosome, distinct from its nucleus and selected lysosomes.',
            limitation: 'One structural snapshot, not a time sequence or an inferred diagnosis. The bacterial count is illustrative.',
            adaptation:
                'Cell engulfing a pathogen; avoid a process-chart replacement. Select approved structures and use supplied observations only; do not invent absent measurements.',
            createdBatch: 'biology-completion',
            fieldDescriptions: { bacteria: 'bacteria', focusPart: '1 lysosomes; 2 phagosome.' }
        },
        'biology.immune.antibody': {
            title: 'Antibody-antigen binding',
            fields: { antigenShape: [1, 2, 1], bound: [0, 1, 0] },
            description: 'An antibody model has two matching antigen-binding sites, with an approved unbound or bound antigen view.',
            limitation: 'Simplified antibody shape and matching antigens; binding alone does not imply destruction or immunity.',
            adaptation:
                'Binding sites and antigen shapes; explicit schematic limitations. Select approved structures and use supplied observations only; do not invent absent measurements.',
            createdBatch: 'biology-completion',
            fieldDescriptions: { antigenShape: 'antigenShape', bound: 'bound' }
        },
        'biology.neural.reflex': {
            title: 'Reflex arc anatomy',
            fields: { focusPart: [1, 4, 2] },
            description: 'A spinal reflex pathway links a receptor, sensory neurone, relay neurone, motor neurone and muscle effector.',
            limitation:
                'Simplified spatial anatomy. Use Stepper or relationship visuals for the sequence; this model does not exclude information reaching the brain.',
            adaptation:
                'Receptor, spinal cord and effector spatial arrangement. Select approved structures and use supplied observations only; do not invent absent measurements.',
            createdBatch: 'biology-completion',
            fieldDescriptions: { focusPart: '1 sensory; 2 relay; 3 motor neurone; 4 muscle effector.' }
        },
        'biology.genetics.dna': {
            title: 'DNA complementary-base model',
            fields: { b1: [1, 4, 1], b2: [1, 4, 3], b3: [1, 4, 2], b4: [1, 4, 4] },
            description: 'Four supplied bases on one DNA strand determine the complementary strand by A\u2013T and C\u2013G pairing.',
            limitation: 'Flat ladder fragment rather than a molecular helix. Complementary answers are visible only in labelled view.',
            adaptation:
                'Complementary base pairs; no arbitrary molecular bonds. Select approved structures and use supplied observations only; do not invent absent measurements.',
            createdBatch: 'biology-completion',
            fieldDescriptions: {
                b1: 'Supplied base: 1 A; 2 T; 3 C; 4 G.',
                b2: 'Supplied base: 1 A; 2 T; 3 C; 4 G.',
                b3: 'Supplied base: 1 A; 2 T; 3 C; 4 G.',
                b4: 'Supplied base: 1 A; 2 T; 3 C; 4 G.'
            }
        },
        'biology.genetics.chromosome': {
            title: 'Chromosome and gene loci',
            fields: { focusLocus: [1, 3, 1] },
            description: 'Two unreplicated homologous chromosomes have corresponding gene loci and explicit allele symbols.',
            limitation:
                'Three supplied gene loci only. Allele symbols do not establish dominance, linkage distance or inheritance outcomes.',
            adaptation:
                'Gene positions and allele pairs explicitly supplied. Select approved structures and use supplied observations only; do not invent absent measurements.',
            createdBatch: 'biology-completion',
            fieldDescriptions: { focusLocus: 'focusLocus' },
            labels: {
                left1: { match: 'Allele L1', example: 'A', maxLength: 3 },
                left2: { match: 'Allele L2', example: 'B', maxLength: 3 },
                left3: { match: 'Allele L3', example: 'C', maxLength: 3 },
                right1: { match: 'Allele R1', example: 'a', maxLength: 3 },
                right2: { match: 'Allele R2', example: 'b', maxLength: 3 },
                right3: { match: 'Allele R3', example: 'c', maxLength: 3 }
            }
        },
        'biology.ecology.transect': {
            title: 'Interrupted belt transect',
            fields: {
                spacingM: [1, 20, 5],
                boundaryM: [0, 80, 12],
                count1: [0, 6, 5],
                count2: [0, 6, 4],
                count3: [0, 6, 2],
                count4: [0, 6, 1],
                count5: [0, 6, 0]
            },
            description:
                'Five sample stations lie at supplied equal spacing along a transect, crossing a given habitat boundary; each station has an observed count.',
            limitation:
                'Station positions and counts are explicit data. Symbol offsets are illustrative; use Chart to analyse numerical trends.',
            adaptation:
                'Spatial sampling positions and habitat boundary. Select approved structures and use supplied observations only; do not invent absent measurements.',
            createdBatch: 'biology-completion',
            fieldDescriptions: {
                spacingM: 'spacingM',
                boundaryM: 'boundaryM',
                count1: 'count1',
                count2: 'count2',
                count3: 'count3',
                count4: 'count4',
                count5: 'count5'
            }
        },
        'biology.respiration.respirometer': {
            title: 'Respirometer apparatus',
            fields: { levelDifferenceMm: [-30, 30, 10], seconds: [10, 600, 120] },
            description:
                'A sealed seed chamber and inert control connect to a manometer; carbon dioxide absorbent is separated from the samples by gauze.',
            limitation:
                'Supplied pressure observation only; suitable controls, capillary area and other data are needed for a respiration rate. Apparatus interpretation, not operating instructions.',
            adaptation:
                'Sealed chamber and manometer; control condition explicit. Select approved structures and use supplied observations only; do not invent absent measurements.',
            createdBatch: 'biology-completion',
            fieldDescriptions: {
                levelDifferenceMm:
                    'Signed right minus left liquid height in drawing coordinates, mm: positive means liquid higher on the seed side.',
                seconds: 'Supplied observation time in seconds.'
            }
        },
        'biology.homeostasis.skin': {
            title: 'Skin thermoregulation section',
            fields: { warm: [0, 1, 1], focusPart: [1, 2, 1] },
            description: 'Skin shows a sweat gland and duct plus superficial blood vessels in an approved warm or cold condition.',
            limitation:
                'Qualitative thermoregulation by effectors under nervous control. Vessel widths and sweat marks are not diagnostic measurements.',
            adaptation:
                'Vessels, sweat gland and surface; labels do not imply hormonal-only control. Select approved structures and use supplied observations only; do not invent absent measurements.',
            createdBatch: 'biology-completion',
            fieldDescriptions: { warm: 'warm', focusPart: '1 sweat gland; 2 blood vessels.' }
        },
        'biology.ecology.pooter': {
            title: 'Pooter sampling apparatus',
            fields: { specimens: [0, 4, 2] },
            description:
                'A collection jar has separate intake and suction tubes, with protective gauze on the suction tube inside the jar.',
            limitation:
                'Identification of apparatus only. Specimen marks reflect the supplied sample; no collection or handling procedure is implied.',
            adaptation:
                'Collection jar, tubes and protective gauze; nonhazardous illustration. Select approved structures and use supplied observations only; do not invent absent measurements.',
            createdBatch: 'biology-completion',
            fieldDescriptions: { specimens: 'specimens' },
            labels: { sampleLabel: { match: 'Sample', example: 'Sample A', maxLength: 16 } }
        },
        'geography.tectonic.constructive': {
            title: 'Constructive plate boundary',
            fields: { setting: [1, 2, 1], riftWidthKm: [5, 60, 20] },
            description: 'Two plates separate around a central rift while magma rises into the opening.',
            limitation:
                'Approved oceanic-spreading and continental-rift views. Given width does not determine vertical relief, crustal thickness or spreading rate.',
            adaptation:
                'Divergent plates and rising magma. Use supplied observations and approved model choices only. This schematic is not evidence of a real location.',
            createdBatch: 'geography-completion',
            fieldDescriptions: { setting: '1 oceanic spreading centre; 2 continental rift.', riftWidthKm: 'riftWidthKm' }
        },
        'geography.tectonic.conservative': {
            title: 'Conservative plate boundary',
            fields: { leftMotion: [-1, 1, 1] },
            description: 'Two plates move in opposite directions parallel to their common fault in plan view.',
            limitation: 'Relative sliding model; displacement, earthquake timing and magnitude are not inferred.',
            adaptation:
                'Parallel plate motion and fault line. Use supplied observations and approved model choices only. This schematic is not evidence of a real location.',
            createdBatch: 'geography-completion',
            fieldDescriptions: { leftMotion: '1 Plate A towards the top of the page; -1 towards the bottom. Plate B moves oppositely.' }
        },
        'geography.tectonic.volcano': {
            title: 'Composite volcano section',
            fields: { layers: [3, 5, 4], erupting: [0, 1, 0] },
            description: 'A composite volcano section has a magma chamber, conduit, side branch, crater and selected cone layers.',
            limitation: 'Layer marks are illustrative; eruption state is an explicit teaching choice, not a hazard prediction.',
            adaptation:
                'Vent, crater and layered cone. Use supplied observations and approved model choices only. This schematic is not evidence of a real location.',
            createdBatch: 'geography-completion',
            fieldDescriptions: { layers: 'layers', erupting: 'erupting' }
        },
        'geography.hazard.earthquake': {
            title: 'Earthquake focus and epicentre',
            fields: { depthKm: [5, 45, 25] },
            description:
                'An earthquake focus lies on a fault below the surface, with its epicentre vertically above and schematic seismic wavefronts.',
            limitation: 'Selected shallow-focus section. Wavefront spacing is not travel time, wave speed or earthquake magnitude.',
            adaptation:
                'Focus beneath surface and epicentre directly above. Use supplied observations and approved model choices only. This schematic is not evidence of a real location.',
            createdBatch: 'geography-completion',
            fieldDescriptions: { depthKm: 'Given focal depth in kilometres; diagram keeps the epicentre vertically aligned.' }
        },
        'geography.weather.tropical_storm': {
            title: 'Mature tropical cyclone section',
            fields: { eyeWidthKm: [10, 80, 35], seaC: [26.5, 32, 28] },
            description:
                'A mature tropical cyclone has rising eyewall air, surface inflow, upper outflow and sinking air in its eye above the ocean.',
            limitation:
                'A vertical section, not the plan-view rotation. Warm water alone does not guarantee cyclone development; this is not a storm forecast.',
            adaptation:
                'Eye, eyewall and rising moist air. Use supplied observations and approved model choices only. This schematic is not evidence of a real location.',
            createdBatch: 'geography-completion',
            fieldDescriptions: { eyeWidthKm: 'eyeWidthKm', seaC: 'seaC' }
        },
        'geography.weather.front': {
            title: 'Frontal rainfall section',
            fields: { frontType: [1, 2, 1] },
            description:
                'Warm-front and cold-front sections distinguish the cold-air wedge, uplift of warm air and precipitation near the front.',
            limitation: 'Qualitative frontal geometry only; clouds and rain marks are not observed amounts or a weather forecast.',
            adaptation:
                'Warm air rises over cold air at front. Use supplied observations and approved model choices only. This schematic is not evidence of a real location.',
            createdBatch: 'geography-completion',
            fieldDescriptions: { frontType: '1 warm front with gentler uplift; 2 cold front with steeper uplift.' }
        },
        'geography.weather.relief_rain': {
            title: 'Relief rainfall section',
            fields: { heightM: [1e3, 3e3, 2200] },
            description: 'Moist air rises over a windward slope, cools and condenses; air descends and warms on the leeward side.',
            limitation:
                'Idealised relief rainfall. A rain shadow depends on actual conditions; summit height alone does not determine rainfall.',
            adaptation:
                'Windward uplift and leeward rain shadow. Use supplied observations and approved model choices only. This schematic is not evidence of a real location.',
            createdBatch: 'geography-completion',
            fieldDescriptions: { heightM: 'heightM' }
        },
        'geography.weather.air_pressure': {
            title: 'High/low pressure cross-sections',
            fields: { high: [0, 1, 1], pressureHpa: [950, 1050, 1028] },
            description: 'High pressure shows sinking air and surface divergence; low pressure shows rising air and convergence.',
            limitation:
                'High and low are relative to surrounding pressure, not a fixed global threshold. Supplied pressure does not alone determine weather.',
            adaptation:
                'Rising/sinking air and surface convergence/divergence. Use supplied observations and approved model choices only. This schematic is not evidence of a real location.',
            createdBatch: 'geography-completion',
            fieldDescriptions: {
                high: '1 a supplied relative high-pressure situation; 0 a supplied relative low.',
                pressureHpa: 'pressureHpa'
            }
        },
        'geography.weather.convection_rain': {
            title: 'Convectional rainfall section',
            fields: { cloudBaseM: [800, 2600, 1800] },
            description: 'Solar heating warms the surface, buoyant air rises and a cloud forms above the supplied condensation level.',
            limitation: 'Qualitative convection model. No rainfall amount, lapse rate or storm severity is inferred.',
            adaptation:
                'Surface heating, rising air and condensation level. Use supplied observations and approved model choices only. This schematic is not evidence of a real location.',
            createdBatch: 'geography-completion',
            fieldDescriptions: { cloudBaseM: 'cloudBaseM' }
        },
        'geography.climate.orbit_variation': {
            title: 'Orbital climate mechanism',
            fields: { tiltDegrees: [22.1, 24.5, 23.4], eccentricity: [0, 0.067, 0.0167] },
            description: 'Separate views show Earth axial tilt and an elliptical orbital model with the Sun at a focus.',
            limitation:
                'Long-timescale orbital mechanisms, not an explanation of present rapid warming. The Sun and Earth are enlarged; seasons are not caused simply by changing distance.',
            adaptation:
                'Schematic orbit/tilt geometry; no misleading causal scale. Use supplied observations and approved model choices only. This schematic is not evidence of a real location.',
            createdBatch: 'geography-completion',
            fieldDescriptions: { tiltDegrees: 'tiltDegrees', eccentricity: 'eccentricity' }
        },
        'geography.river.oxbow': {
            title: 'Oxbow lake formation geometry',
            fields: { stage: [1, 3, 1] },
            description: 'A meander neck, flood cut-through or isolated oxbow is shown as one spatial stage with downstream flow.',
            limitation: 'Use Stepper for the full temporal sequence. No formation time or actual river history is inferred.',
            adaptation:
                'Neck narrowing, cut-through and isolated channel. Use supplied observations and approved model choices only. This schematic is not evidence of a real location.',
            createdBatch: 'geography-completion',
            fieldDescriptions: { stage: '1 narrow neck; 2 flood cut-through; 3 abandoned oxbow separated by deposits.' }
        },
        'geography.river.drainage_basin': {
            title: 'Drainage basin topography',
            fields: { tributaries: [1, 4, 3] },
            description: 'A watershed encloses a main channel joined by supplied selected tributaries, draining to one outlet.',
            limitation:
                'Generic basin topology, not a real map. Tributary count is a chosen schematic extent, not a measured drainage density.',
            adaptation:
                'Watershed, tributary, confluence and outlet. Use supplied observations and approved model choices only. This schematic is not evidence of a real location.',
            createdBatch: 'geography-completion',
            fieldDescriptions: { tributaries: 'tributaries' }
        },
        'geography.river.levee': {
            title: 'Floodplain and levee section',
            fields: { waterDepthM: [1, 5, 3] },
            description:
                'A river cross-section shows raised natural levees beside a lower floodplain and a supplied in-channel water depth.',
            limitation: 'Selected depositional structure; the picture does not predict inundation from water depth alone.',
            adaptation:
                'River banks and deposited sediment layers. Use supplied observations and approved model choices only. This schematic is not evidence of a real location.',
            createdBatch: 'geography-completion',
            fieldDescriptions: { waterDepthM: 'waterDepthM' }
        },
        'geography.river.hard_management': {
            title: 'Dam and reservoir section',
            fields: { storageDepthM: [10, 50, 30] },
            description: 'A dam retains water upstream of its structure, with a spillway descending to a downstream channel.',
            limitation: 'Dry spillway shown: given storage depth does not imply an operational release, storage volume or flood risk.',
            adaptation:
                'Upstream storage, spillway and downstream channel. Use supplied observations and approved model choices only. This schematic is not evidence of a real location.',
            createdBatch: 'geography-completion',
            fieldDescriptions: { storageDepthM: 'storageDepthM' }
        },
        'geography.river.soft_management': {
            title: 'Floodplain restoration section',
            fields: { flooded: [0, 1, 0], setbackM: [50, 300, 200] },
            description: 'A restored floodplain and set-back embankment leave space for temporary high-flow storage beside the channel.',
            limitation:
                'The selected normal/high-flow state is explicit. A setback distance does not determine storage volume or guarantee flood protection.',
            adaptation:
                'Set-back embankment and flood-storage area. Use supplied observations and approved model choices only. This schematic is not evidence of a real location.',
            createdBatch: 'geography-completion',
            fieldDescriptions: { flooded: 'flooded', setbackM: 'setbackM' }
        },
        'geography.coast.arch_stack': {
            title: 'Coastal arch and stack',
            fields: { stage: [1, 3, 1] },
            description: 'One approved coastal spatial stage shows a rock arch, an isolated stack or a low stump next to a headland.',
            limitation: 'Use Stepper for a process sequence. The stages do not predict erosion speed or an actual coast\u2019s history.',
            adaptation:
                'Cliff, cave/arch and isolated stack geometry. Use supplied observations and approved model choices only. This schematic is not evidence of a real location.',
            createdBatch: 'geography-completion',
            fieldDescriptions: { stage: '1 arch; 2 stack after roof collapse; 3 stump.' }
        },
        'geography.coast.wave_platform': {
            title: 'Wave-cut platform section',
            fields: { platformWidthM: [20, 100, 60] },
            description: 'A cliff notch meets a gently seaward-sloping wave-cut platform, with wave approach and landward retreat arrows.',
            limitation: 'A selected erosional section, not a tidal-level or rock-strength calculation.',
            adaptation:
                'Cliff notch and exposed gently sloping platform. Use supplied observations and approved model choices only. This schematic is not evidence of a real location.',
            createdBatch: 'geography-completion',
            fieldDescriptions: { platformWidthM: 'platformWidthM' }
        },
        'geography.coast.management': {
            title: 'Sea wall and groyne geometry',
            fields: { defence: [1, 2, 1] },
            description:
                'A sea-wall cross-section or groyne plan shows the defence\u2019s position relative to waves, beach and sediment movement.',
            limitation:
                'Two approved projections of coastal defences. Do not infer effectiveness, cost or environmental impact from geometry alone.',
            adaptation:
                'Defence placement and sediment transport direction. Use supplied observations and approved model choices only. This schematic is not evidence of a real location.',
            createdBatch: 'geography-completion',
            fieldDescriptions: { defence: '1 curved sea wall section; 2 groynes in plan with drift towards page bottom.' }
        },
        'geography.glacial.corrie': {
            title: 'Corrie cross-section',
            fields: { icePresent: [0, 1, 1] },
            description: 'A corrie basin lies beneath a steep backwall and behind a lip, occupied by ice or by a post-glacial tarn.',
            limitation: 'Idealised erosional structure; the ice and post-glacial views are separate states, not a measured chronology.',
            adaptation:
                'Basin, backwall, lip and rotational ice motion. Use supplied observations and approved model choices only. This schematic is not evidence of a real location.',
            createdBatch: 'geography-completion',
            fieldDescriptions: { icePresent: 'icePresent' }
        },
        'geography.glacial.moraine': {
            title: 'Glacial moraine positions',
            fields: { focusDeposit: [1, 3, 1] },
            description: 'Lateral, medial and terminal debris are placed around a schematic valley glacier in plan view.',
            limitation: 'Selected debris positions; stone sizes and numbers are illustrative, not a sediment sample.',
            adaptation:
                'Lateral, medial and terminal deposits around a glacier. Use supplied observations and approved model choices only. This schematic is not evidence of a real location.',
            createdBatch: 'geography-completion',
            fieldDescriptions: { focusDeposit: '1 lateral; 2 medial; 3 terminal moraine.' }
        },
        'geography.glacial.freeze_thaw': {
            title: 'Freeze-thaw joint model',
            fields: { frozen: [0, 1, 0], jointMm: [0.5, 10, 2] },
            description: 'Water occupies a rock joint or expands as ice in an explicitly selected freezing state.',
            limitation: 'Expansion is deliberately exaggerated for explanation; one freeze does not imply a measured fracture or rockfall.',
            adaptation:
                'Rock crack and water/ice expansion; schematic before/after. Use supplied observations and approved model choices only. This schematic is not evidence of a real location.',
            createdBatch: 'geography-completion',
            fieldDescriptions: { frozen: 'frozen', jointMm: 'jointMm' }
        },
        'geography.ecosystem.rainforest': {
            title: 'Rainforest vertical layers',
            fields: { canopyTrees: [4, 6, 5] },
            description: 'A tropical rainforest section distinguishes emergent, canopy, understorey and forest-floor layers.',
            limitation: 'A representative layered model, not universal tree heights or a measured population density.',
            adaptation:
                'Emergent, canopy, understorey and floor. Use supplied observations and approved model choices only. This schematic is not evidence of a real location.',
            createdBatch: 'geography-completion',
            fieldDescriptions: { canopyTrees: 'canopyTrees' }
        },
        'geography.ecosystem.desert_plant': {
            title: 'Desert plant adaptations',
            fields: { focusPart: [1, 3, 1] },
            description: 'A named saguaro-type cactus model shows a water-storing stem, spines and shallow spreading roots.',
            limitation: 'Selected cactus adaptations; not all desert plants have this structure or physiology.',
            adaptation:
                'Roots, leaves and water storage; identify actual plant. Use supplied observations and approved model choices only. This schematic is not evidence of a real location.',
            createdBatch: 'geography-completion',
            fieldDescriptions: { focusPart: '1 water-storing stem; 2 spines; 3 spreading roots.' }
        },
        'geography.ecosystem.nutrient_stores': {
            title: 'Nutrient locations in a forest section',
            fields: { focusStore: [1, 3, 1] },
            description: 'Biomass, surface litter and soil occupy distinct physical locations in a forest section.',
            limitation:
                'No nutrient amounts or transfer rates are inferred. Use Chart for quantitative stores and learning_visual for a nutrient-cycle network.',
            adaptation:
                'Soil, litter and biomass positions; numerical stores use charts. Use supplied observations and approved model choices only. This schematic is not evidence of a real location.',
            createdBatch: 'geography-completion',
            fieldDescriptions: { focusStore: '1 biomass; 2 litter; 3 soil.' }
        },
        'geography.desert.dune': {
            title: 'Sand-dune cross-section',
            fields: { slipDegrees: [28, 36, 32] },
            description: 'A dune section distinguishes a gentle windward side, crest and steeper downwind slip face with a supplied angle.',
            limitation: 'A selected dune profile; sand type, wind strength and dune migration rate are not inferred.',
            adaptation:
                'Windward slope, slip face and transport direction. Use supplied observations and approved model choices only. This schematic is not evidence of a real location.',
            createdBatch: 'geography-completion',
            fieldDescriptions: { slipDegrees: 'slipDegrees' }
        },
        'geography.desert.water_table': {
            title: 'Desert aquifer and oasis',
            fields: { tableDepthM: [20, 45, 30] },
            description: 'An aquifer lies above an impermeable layer; the water table meets a low depression to form an oasis surface.',
            limitation:
                'Selected unconfined aquifer model. The supplied depth is at the reference bank; not every desert depression exposes groundwater.',
            adaptation:
                'Water table, permeable rock and spring context. Use supplied observations and approved model choices only. This schematic is not evidence of a real location.',
            createdBatch: 'geography-completion',
            fieldDescriptions: { tableDepthM: 'tableDepthM' }
        },
        'geography.urban.land_use': {
            title: 'Urban land-use cross-section',
            fields: { centralBlocks: [3, 5, 4] },
            description: 'A generic urban section moves from central taller buildings to lower residential development and a rural edge.',
            limitation:
                'A simplified model, not a universal city pattern. Real-city claims need verified maps, images and supplied evidence.',
            adaptation:
                'Generic spatial model; real city evidence uses maps. Use supplied observations and approved model choices only. This schematic is not evidence of a real location.',
            createdBatch: 'geography-completion',
            fieldDescriptions: { centralBlocks: 'centralBlocks' }
        },
        'geography.fieldwork.river_measurement': {
            title: 'River fieldwork apparatus',
            fields: { widthM: [1, 50, 8], depthM: [0.1, 3, 0.8], velocityMs: [0, 3, 0.6], stationFraction: [0.2, 0.8, 0.5] },
            description:
                'A tape spans the wetted channel, and a depth ruler sits at the supplied fractional station; the velocity observation remains explicit.',
            limitation:
                'Section geometry is schematic; measurements are supplied, not inferred. It is not guidance to enter a river or a discharge calculation.',
            adaptation:
                'Width, depth and velocity sampling positions. Use supplied observations and approved model choices only. This schematic is not evidence of a real location.',
            createdBatch: 'geography-completion',
            fieldDescriptions: {
                widthM: 'widthM',
                depthM: 'depthM',
                velocityMs: 'Supplied velocity observation in metres per second.',
                stationFraction: 'Sampling location across the wetted width, from 0.2 to 0.8 of the span.'
            },
            labels: { siteLabel: { match: 'Site', example: 'Site A', maxLength: 16 } }
        },
        'geography.skills.contour_section': {
            title: 'Contour and relief section',
            fields: { contours: [3, 5, 4], baseM: [0, 1500, 100], intervalM: [10, 100, 50], summitM: [25, 2100, 275] },
            description:
                'An explicitly idealised conical hill has supplied outer elevation, contour interval, contour count and summit elevation, with a matching central section.',
            limitation:
                'Not a reconstruction of a real contour map. Summit elevation is supplied rather than guessed from closed contours; vertical scale is exaggerated.',
            adaptation:
                'Supplied elevations; preserve cartographic accuracy. Use supplied observations and approved model choices only. This schematic is not evidence of a real location.',
            createdBatch: 'geography-completion',
            fieldDescriptions: { contours: 'contours', baseM: 'baseM', intervalM: 'intervalM', summitM: 'summitM' }
        },
        'geography.urban.sustainable_drainage': {
            title: 'Urban drainage section',
            fields: { wet: [0, 1, 0] },
            description: 'Permeable paving, a planted swale and a storage chamber show approved dry or wet drainage states.',
            limitation:
                'Selected swale with an underdrain, not a universal drainage design or flood-capacity calculation. Ground conditions determine whether infiltration is suitable.',
            adaptation:
                'Permeable paving, swale and storage basin. Use supplied observations and approved model choices only. This schematic is not evidence of a real location.',
            createdBatch: 'geography-completion',
            fieldDescriptions: { wet: 'wet' }
        },
        'geography.energy.hydropower': {
            title: 'Hydroelectric scheme section',
            fields: { headM: [10, 200, 80] },
            description:
                'An intake and penstock carry reservoir water to a turbine/generator building, then return water to a lower channel.',
            limitation:
                'Supplied head alone does not determine power; flow, efficiency and other data are required. This section is schematic, not an engineering design.',
            adaptation:
                'Intake, penstock, turbine and outfall geometry. Use supplied observations and approved model choices only. This schematic is not evidence of a real location.',
            createdBatch: 'geography-completion',
            fieldDescriptions: { headM: 'headM' }
        },
        'geography.fieldwork.beach_profile': {
            title: 'Beach-profile survey apparatus',
            fields: { slopeDegrees: [0, 20, 8], distanceM: [2, 30, 10] },
            description:
                'Two ranging poles stand on a beach-profile segment, with equal-height sighting points, a tape along the slope and a horizontal reference.',
            limitation:
                'One upslope survey segment; angles and tape distances are supplied. Do not invent observations or infer a full beach profile.',
            adaptation:
                'Ranging poles, tape and clinometer measurement positions. Use supplied observations and approved model choices only. This schematic is not evidence of a real location.',
            createdBatch: 'geography-completion',
            fieldDescriptions: { slopeDegrees: 'slopeDegrees', distanceM: 'distanceM' }
        },
        'history.norman.stone_keep': {
            title: 'Stone keep cutaway',
            fields: { floors: [2, 4, 3] },
            description: 'A stone keep cutaway distinguishes thick walls, internal floors and an elevated entrance.',
            limitation:
                '12th-century model; floor count and wall dimensions must not be attributed to a named keep without evidence. Original teaching reconstruction, not an authentic historical source.',
            adaptation:
                'Defensive entrances, wall thickness and occupied floors. Choose this only for structural or spatial explanation. Use supplied question intent to select the approved feature or model extent. Counts are illustrative unless separately evidenced; never infer site, date, capacity or event details. Use verified images for authentic source analysis and Mermaid/learning_visual for causal relationships.',
            createdBatch: 'history-completion',
            fieldDescriptions: { floors: 'Number of storeys shown in a selected great-tower model.' }
        },
        'history.norman.gatehouse': {
            title: 'Castle gatehouse section',
            fields: { gateRaised: [0, 1, 0] },
            description: 'A gatehouse section places a portcullis and ceiling opening over a passage.',
            limitation:
                'Selected medieval fortified-gateway features; not all Norman gateways had this mature arrangement. Original teaching reconstruction, not an authentic historical source.',
            adaptation:
                'Portcullis, passage and defensive openings. Choose this only for structural or spatial explanation. Use supplied question intent to select the approved feature or model extent. Counts are illustrative unless separately evidenced; never infer site, date, capacity or event details. Use verified images for authentic source analysis and Mermaid/learning_visual for causal relationships.',
            createdBatch: 'history-completion',
            fieldDescriptions: { gateRaised: '0 lowered grille; 1 raised grille.' }
        },
        'history.medieval.open_field': {
            title: 'Open-field village model',
            fields: { strips: [4, 8, 6] },
            description: 'Arable strips surround a settlement with common pasture and paths.',
            limitation:
                'A generic open-field model; actual tenure, crop rotation and field boundaries varied. Original teaching reconstruction, not an authentic historical source.',
            adaptation:
                'Village, arable strips and common pasture. Choose this only for structural or spatial explanation. Use supplied question intent to select the approved feature or model extent. Counts are illustrative unless separately evidenced; never infer site, date, capacity or event details. Use verified images for authentic source analysis and Mermaid/learning_visual for causal relationships.',
            createdBatch: 'history-completion',
            fieldDescriptions: { strips: 'Number of selected strips shown per arable field; not land ownership data.' }
        },
        'history.medieval.manor': {
            title: 'Medieval manor layout',
            fields: { mill: [0, 1, 0] },
            description: 'An estate model separates the manor house, service yard and barn, optionally including a mill beside a stream.',
            limitation:
                'A spatial teaching selection, not a universal manor plan or proof that a manor owned a mill. Original teaching reconstruction, not an authentic historical source.',
            adaptation:
                'Generic settlement and estate buildings. Choose this only for structural or spatial explanation. Use supplied question intent to select the approved feature or model extent. Counts are illustrative unless separately evidenced; never infer site, date, capacity or event details. Use verified images for authentic source analysis and Mermaid/learning_visual for causal relationships.',
            createdBatch: 'history-completion',
            fieldDescriptions: { mill: '0 house, barn and yard; 1 also include a watermill and stream.' }
        },
        'history.medieval.church': {
            title: 'Medieval church plan',
            fields: { transepts: [0, 1, 1] },
            description: 'An east-oriented church plan distinguishes the nave and chancel, optionally with transepts.',
            limitation:
                'Approved simplified church forms; orientation and building phases must be checked for a real site. Original teaching reconstruction, not an authentic historical source.',
            adaptation:
                'Nave, chancel, transepts and orientation. Choose this only for structural or spatial explanation. Use supplied question intent to select the approved feature or model extent. Counts are illustrative unless separately evidenced; never infer site, date, capacity or event details. Use verified images for authentic source analysis and Mermaid/learning_visual for causal relationships.',
            createdBatch: 'history-completion',
            fieldDescriptions: { transepts: '0 simple nave and chancel; 1 add north and south transepts.' }
        },
        'history.medieval.town': {
            title: 'Medieval town layout',
            fields: { marketStalls: [2, 6, 4] },
            description: 'A walled settlement surrounds crossing streets and a marketplace with selected stalls.',
            limitation:
                'Generic medieval market-town model, not a plan of a historical town or population data. Original teaching reconstruction, not an authentic historical source.',
            adaptation:
                'Walls, market and street network; generic reconstruction. Choose this only for structural or spatial explanation. Use supplied question intent to select the approved feature or model extent. Counts are illustrative unless separately evidenced; never infer site, date, capacity or event details. Use verified images for authentic source analysis and Mermaid/learning_visual for causal relationships.',
            createdBatch: 'history-completion',
            fieldDescriptions: { marketStalls: 'Selected stall count in a schematic marketplace.' }
        },
        'history.medicine.herb_garden': {
            title: 'Monastic physic garden',
            fields: { beds: [3, 6, 4] },
            description: 'Paths separate selected planting beds in a monastic physic-garden reconstruction.',
            limitation:
                'Bed arrangement is original; species, medical efficacy and specific remedies are not inferred. Original teaching reconstruction, not an authentic historical source.',
            adaptation:
                'Selected physic-garden beds; no inferred plant species or remedies. Choose this only for structural or spatial explanation. Use supplied question intent to select the approved feature or model extent. Counts are illustrative unless separately evidenced; never infer site, date, capacity or event details. Use verified images for authentic source analysis and Mermaid/learning_visual for causal relationships.',
            createdBatch: 'history-completion',
            fieldDescriptions: { beds: 'Number of illustrative planting beds.' }
        },
        'history.medicine.galen_anatomy': {
            title: 'Historical anatomical model comparison',
            fields: { model: [1, 2, 1] },
            description:
                'A schematic heart section contrasts the obsolete claim of invisible pores between ventricles with the modern intact septum.',
            limitation:
                'Historically obsolete claims are explicitly identified. This restricted comparison does not represent all Galenic anatomy or the full circulation. Original teaching reconstruction, not an authentic historical source.',
            adaptation:
                'Clearly mark obsolete claims versus modern anatomy. Choose this only for structural or spatial explanation. Use supplied question intent to select the approved feature or model extent. Counts are illustrative unless separately evidenced; never infer site, date, capacity or event details. Use verified images for authentic source analysis and Mermaid/learning_visual for causal relationships.',
            createdBatch: 'history-completion',
            fieldDescriptions: { model: '1 obsolete Galenic septal-pore claim; 2 modern intact septum.' }
        },
        'history.medicine.harvey_circulation': {
            title: 'Harvey circulation teaching plate',
            fields: { valveDetail: [0, 1, 0] },
            description: 'A simplified forearm vein returns blood towards the heart; an optional inset distinguishes a one-way valve.',
            limitation:
                'Modern teaching reconstruction of Harvey-related evidence; not a reproduction of an original plate or a claim that Harvey saw capillaries. Original teaching reconstruction, not an authentic historical source.',
            adaptation:
                'Historical reconstruction distinguished from facsimile. Choose this only for structural or spatial explanation. Use supplied question intent to select the approved feature or model extent. Counts are illustrative unless separately evidenced; never infer site, date, capacity or event details. Use verified images for authentic source analysis and Mermaid/learning_visual for causal relationships.',
            createdBatch: 'history-completion',
            fieldDescriptions: { valveDetail: '0 show directional venous return; 1 add a one-way valve inset.' }
        },
        'history.public_health.cholera_pump': {
            title: 'Victorian water-pump section',
            fields: { contaminated: [0, 1, 0] },
            description: 'A street pump draws from groundwater; an explicit optional overlay shows contamination from nearby waste.',
            limitation:
                'Generic 19th-century water-supply section, not the Broad Street pump site or a reconstruction of measured epidemiological evidence. Original teaching reconstruction, not an authentic historical source.',
            adaptation:
                'Supply and contamination context; real maps use evidence. Choose this only for structural or spatial explanation. Use supplied question intent to select the approved feature or model extent. Counts are illustrative unless separately evidenced; never infer site, date, capacity or event details. Use verified images for authentic source analysis and Mermaid/learning_visual for causal relationships.',
            createdBatch: 'history-completion',
            fieldDescriptions: { contaminated: '0 pump and groundwater section; 1 add an illustrative contamination pathway.' }
        },
        'history.public_health.sewer': {
            title: 'Victorian sewer cross-section',
            fields: { showOutfall: [0, 1, 0] },
            description: 'A street drain reaches a large sewer below a separate drinking-water supply pipe.',
            limitation:
                'Victorian infrastructure model. Outfall geometry is selected; treatment, exact route and sanitation outcomes are not inferred. Original teaching reconstruction, not an authentic historical source.',
            adaptation:
                'Street, water supply and waste routes. Choose this only for structural or spatial explanation. Use supplied question intent to select the approved feature or model extent. Counts are illustrative unless separately evidenced; never infer site, date, capacity or event details. Use verified images for authentic source analysis and Mermaid/learning_visual for causal relationships.',
            createdBatch: 'history-completion',
            fieldDescriptions: { showOutfall: '0 main cross-section; 1 include a selected outfall branch.' }
        },
        'history.medicine.penicillin_plate': {
            title: 'Penicillin culture-plate illustration',
            fields: { inhibitionRegion: [1, 2, 1] },
            description: 'A schematic plate places bacterial growth outside a clear region around a mould colony.',
            limitation:
                'Fleming-era inhibition principle. The region is qualitative, not an invented historical plate measurement or antibiotic-susceptibility result. Original teaching reconstruction, not an authentic historical source.',
            adaptation:
                'Zone around mould; schematic not fabricated experiment data. Choose this only for structural or spatial explanation. Use supplied question intent to select the approved feature or model extent. Counts are illustrative unless separately evidenced; never infer site, date, capacity or event details. Use verified images for authentic source analysis and Mermaid/learning_visual for causal relationships.',
            createdBatch: 'history-completion',
            fieldDescriptions: {
                inhibitionRegion:
                    '1 narrower illustrative clear region; 2 broader illustrative clear region. These are approved shapes, not measured radii.'
            }
        },
        'history.crime.panopticon': {
            title: 'Panopticon prison plan',
            fields: { cellSectors: [8, 16, 12] },
            description: 'An outer ring of cells faces a central inspection tower in a Panopticon model.',
            limitation:
                'Bentham proposed this inspection-house principle; the illustration does not imply his design was built as shown. Original teaching reconstruction, not an authentic historical source.',
            adaptation:
                'Design proposal with central observation geometry. Choose this only for structural or spatial explanation. Use supplied question intent to select the approved feature or model extent. Counts are illustrative unless separately evidenced; never infer site, date, capacity or event details. Use verified images for authentic source analysis and Mermaid/learning_visual for causal relationships.',
            createdBatch: 'history-completion',
            fieldDescriptions: { cellSectors: 'Illustrative sectors in the ring, not the exact cells in a particular drawing.' }
        },
        'history.crime.separate_prison': {
            title: 'Separate-system prison wing',
            fields: { cellPairs: [3, 6, 4] },
            description: 'Individual cells open onto a shared corridor, with outer windows and separate doors.',
            limitation:
                '19th-century separate-system spatial principle; not a complete plan of Pentonville or evidence of everyday practice. Original teaching reconstruction, not an authentic historical source.',
            adaptation:
                'Cells and corridor; source-specific variations explicit. Choose this only for structural or spatial explanation. Use supplied question intent to select the approved feature or model extent. Counts are illustrative unless separately evidenced; never infer site, date, capacity or event details. Use verified images for authentic source analysis and Mermaid/learning_visual for causal relationships.',
            createdBatch: 'history-completion',
            fieldDescriptions: { cellPairs: 'Number of cell pairs in a selected wing bay, not total prison capacity.' }
        },
        'history.crime.police_equipment': {
            title: 'Victorian policing equipment plate',
            fields: { object: [1, 3, 1] },
            description: 'A selected later-Victorian policing object is shown as an isolated teaching profile.',
            limitation:
                'Generic object form, not an authenticated artefact. For provenance, manufacture dates or an individual officer, use verified collection evidence. Original teaching reconstruction, not an authentic historical source.',
            adaptation:
                'Dated, source-supported objects only. Choose this only for structural or spatial explanation. Use supplied question intent to select the approved feature or model extent. Counts are illustrative unless separately evidenced; never infer site, date, capacity or event details. Use verified images for authentic source analysis and Mermaid/learning_visual for causal relationships.',
            createdBatch: 'history-completion',
            fieldDescriptions: { object: '1 wooden truncheon; 2 whistle; 3 hand lantern.' }
        },
        'history.american_west.tipi': {
            title: 'Plains tipi structure',
            fields: { cutaway: [0, 1, 0] },
            description: 'A Lakota-type tipi model identifies supporting poles, a covering, smoke flaps and an entrance.',
            limitation:
                'A bounded structural teaching model; no decoration or pan-Indigenous generalisation. Individual nations and tipi makers have distinct forms. Original teaching reconstruction, not an authentic historical source.',
            adaptation:
                'Named cultural context; historically reviewed reconstruction. Choose this only for structural or spatial explanation. Use supplied question intent to select the approved feature or model extent. Counts are illustrative unless separately evidenced; never infer site, date, capacity or event details. Use verified images for authentic source analysis and Mermaid/learning_visual for causal relationships.',
            createdBatch: 'history-completion',
            fieldDescriptions: { cutaway: '0 outer structure; 1 selected cutaway of poles and lower lining.' }
        },
        'history.american_west.wagon': {
            title: 'Overland wagon cutaway',
            fields: { crates: [2, 5, 3] },
            description: 'A covered wagon has a canvas shelter above a cargo bed and spoked wheels.',
            limitation:
                '19th-century overland wagon model, not a named emigrant vehicle, cargo record or payload calculation. Original teaching reconstruction, not an authentic historical source.',
            adaptation:
                'Storage and shelter construction; migration maps elsewhere. Choose this only for structural or spatial explanation. Use supplied question intent to select the approved feature or model extent. Counts are illustrative unless separately evidenced; never infer site, date, capacity or event details. Use verified images for authentic source analysis and Mermaid/learning_visual for causal relationships.',
            createdBatch: 'history-completion',
            fieldDescriptions: { crates: 'Number of illustrative cargo packages visible through a selected cutaway.' }
        },
        'history.american_west.sod_house': {
            title: 'Homesteader sod-house section',
            fields: { wallCourses: [4, 8, 6] },
            description: 'Sod-block walls support a roof in a homesteader dwelling section.',
            limitation:
                'Late-19th-century Great Plains context; selected construction features do not establish a universal dwelling type or a real house plan. Original teaching reconstruction, not an authentic historical source.',
            adaptation:
                'Wall and roof construction with source context. Choose this only for structural or spatial explanation. Use supplied question intent to select the approved feature or model extent. Counts are illustrative unless separately evidenced; never infer site, date, capacity or event details. Use verified images for authentic source analysis and Mermaid/learning_visual for causal relationships.',
            createdBatch: 'history-completion',
            fieldDescriptions: { wallCourses: 'Illustrative courses in the sod walls, not a building specification.' }
        },
        'history.cold_war.berlin_wall': {
            title: 'Berlin Wall section',
            fields: { focusPart: [1, 3, 1] },
            description: 'A late Berlin border-system model separates the border wall, guarded strip and inner wall.',
            limitation:
                'Later-1970s to 1980s teaching selection, not the barrier of 1961 or an exact local border cross-section. No fixed strip width is implied. Original teaching reconstruction, not an authentic historical source.',
            adaptation:
                'Dated arrangement; do not imply same design for all years. Choose this only for structural or spatial explanation. Use supplied question intent to select the approved feature or model extent. Counts are illustrative unless separately evidenced; never infer site, date, capacity or event details. Use verified images for authentic source analysis and Mermaid/learning_visual for causal relationships.',
            createdBatch: 'history-completion',
            fieldDescriptions: { focusPart: 'Select the labelled feature: 1 western border wall; 2 watchtower; 3 inner wall.' }
        },
        'history.source.printing_press': {
            title: 'Printing press structure',
            fields: { pressOpen: [0, 1, 1] },
            description: 'A screw-operated hand press positions a platen above a type bed within a wooden frame.',
            limitation:
                'Early-modern printing-press structure, not a facsimile or a working mechanical specification. Original teaching reconstruction, not an authentic historical source.',
            adaptation:
                'Object anatomy; provenance and interpretations remain prose. Choose this only for structural or spatial explanation. Use supplied question intent to select the approved feature or model extent. Counts are illustrative unless separately evidenced; never infer site, date, capacity or event details. Use verified images for authentic source analysis and Mermaid/learning_visual for causal relationships.',
            createdBatch: 'history-completion',
            fieldDescriptions: { pressOpen: '1 platen raised; 0 platen lowered towards the type bed.' }
        },
        'history.medicine.barber_surgeon': {
            title: 'Barber-surgeon instrument plate',
            fields: { instrument: [1, 3, 1] },
            description: 'One selected early-modern surgical instrument is isolated for structural observation.',
            limitation:
                'Generic historical forms; not an attributed museum object, usage procedure or a claim every barber-surgeon owned each item. Original teaching reconstruction, not an authentic historical source.',
            adaptation:
                'Dated source-supported tools; no procedural instruction. Choose this only for structural or spatial explanation. Use supplied question intent to select the approved feature or model extent. Counts are illustrative unless separately evidenced; never infer site, date, capacity or event details. Use verified images for authentic source analysis and Mermaid/learning_visual for causal relationships.',
            createdBatch: 'history-completion',
            fieldDescriptions: { instrument: '1 lancet profile; 2 forceps profile; 3 surgical saw profile.' }
        },
        'history.medicine.anaesthetic_inhaler': {
            title: 'Historical anaesthetic inhaler',
            fields: { cutaway: [0, 1, 0] },
            description: 'A simplified 19th-century inhaler separates an absorbent-material chamber from a facepiece.',
            limitation:
                'Historical object study informed by Murphy-type apparatus. It gives no dosage or operating instructions and is not a dimensioned replica. Original teaching reconstruction, not an authentic historical source.',
            adaptation:
                'Object construction from a dated reference; not medical advice. Choose this only for structural or spatial explanation. Use supplied question intent to select the approved feature or model extent. Counts are illustrative unless separately evidenced; never infer site, date, capacity or event details. Use verified images for authentic source analysis and Mermaid/learning_visual for causal relationships.',
            createdBatch: 'history-completion',
            fieldDescriptions: { cutaway: '0 exterior; 1 expose an absorbent-material chamber.' }
        },
        'history.medicine.lister_spray': {
            title: 'Antiseptic spray apparatus',
            fields: { focusPart: [1, 3, 1] },
            description: 'A later-19th-century Lister-type steam spray has a tank, outlet and carrying handle.',
            limitation:
                'Selected external parts, not a replica of one surviving spray or a diagram of an operating medical procedure. Original teaching reconstruction, not an authentic historical source.',
            adaptation:
                'Historical object schematic; no use instructions. Choose this only for structural or spatial explanation. Use supplied question intent to select the approved feature or model extent. Counts are illustrative unless separately evidenced; never infer site, date, capacity or event details. Use verified images for authentic source analysis and Mermaid/learning_visual for causal relationships.',
            createdBatch: 'history-completion',
            fieldDescriptions: { focusPart: '1 tank; 2 outlet; 3 handle.' }
        },
        'history.medicine.xray_room': {
            title: 'Early X-ray-room reconstruction',
            fields: { beamOverlay: [0, 1, 0] },
            description: 'A historical X-ray-room model separates a tube, support, table and receiving plate.',
            limitation:
                'Generic early-20th-century reconstruction. The apparatus and arrangement are not a present-day safety specification or an authentic clinical image. Original teaching reconstruction, not an authentic historical source.',
            adaptation:
                'Source-supported equipment positions; contrast with present-day safety in prose. Choose this only for structural or spatial explanation. Use supplied question intent to select the approved feature or model extent. Counts are illustrative unless separately evidenced; never infer site, date, capacity or event details. Use verified images for authentic source analysis and Mermaid/learning_visual for causal relationships.',
            createdBatch: 'history-completion',
            fieldDescriptions: { beamOverlay: '0 apparatus positions only; 1 show an illustrative tube-to-plate projection.' }
        },
        'history.medicine.hospital_pavilion': {
            title: 'Pavilion hospital plan',
            fields: { bedPairs: [3, 7, 5] },
            description: 'Opposing beds and windows flank a central aisle in a pavilion-ward teaching model.',
            limitation:
                '19th-century spatial principle; observed ventilation, infection rates and named hospital layouts require their own evidence. Original teaching reconstruction, not an authentic historical source.',
            adaptation:
                'Ventilation and ward layout from a named period. Choose this only for structural or spatial explanation. Use supplied question intent to select the approved feature or model extent. Counts are illustrative unless separately evidenced; never infer site, date, capacity or event details. Use verified images for authentic source analysis and Mermaid/learning_visual for causal relationships.',
            createdBatch: 'history-completion',
            fieldDescriptions: { bedPairs: 'Illustrative bed pairs in a selected ward bay; not a historical capacity.' }
        },
        'history.medicine.operating_theatre': {
            title: 'Historical operating-theatre section',
            fields: { tiers: [2, 4, 3] },
            description: 'Raised viewing tiers surround an operating space in a historical teaching theatre section.',
            limitation:
                '19th-century model, not the plan of a named theatre. No operation is depicted or medical procedure taught. Original teaching reconstruction, not an authentic historical source.',
            adaptation:
                'Viewing tiers and operating space; not a procedure. Choose this only for structural or spatial explanation. Use supplied question intent to select the approved feature or model extent. Counts are illustrative unless separately evidenced; never infer site, date, capacity or event details. Use verified images for authentic source analysis and Mermaid/learning_visual for causal relationships.',
            createdBatch: 'history-completion',
            fieldDescriptions: { tiers: 'Number of illustrative viewing tiers on each side.' }
        },
        'history.crime.treadwheel': {
            title: 'Prison treadwheel structure',
            fields: { partitions: [3, 6, 4] },
            description: 'A stepped drum sits on supports under a handrail and partitions in a prison treadwheel model.',
            limitation:
                '19th-century mechanism study; labour conditions and prisoner experiences must come from evidence, not this schematic. Original teaching reconstruction, not an authentic historical source.',
            adaptation:
                'Historical mechanism and labour setting. Choose this only for structural or spatial explanation. Use supplied question intent to select the approved feature or model extent. Counts are illustrative unless separately evidenced; never infer site, date, capacity or event details. Use verified images for authentic source analysis and Mermaid/learning_visual for causal relationships.',
            createdBatch: 'history-completion',
            fieldDescriptions: { partitions: 'Selected number of working bays, not a prison labour or capacity record.' }
        },
        'history.crime.courtroom': {
            title: 'Historic courtroom plan',
            fields: { focusRole: [1, 4, 1] },
            description: 'A schematic courtroom locates a judge, jury, witness position and dock in distinct spaces.',
            limitation:
                'Selected 19th-century English courtroom model; layouts and procedures varied. It does not portray a named trial. Original teaching reconstruction, not an authentic historical source.',
            adaptation:
                'Spatial roles of judge, jury and witnesses; period explicit. Choose this only for structural or spatial explanation. Use supplied question intent to select the approved feature or model extent. Counts are illustrative unless separately evidenced; never infer site, date, capacity or event details. Use verified images for authentic source analysis and Mermaid/learning_visual for causal relationships.',
            createdBatch: 'history-completion',
            fieldDescriptions: { focusRole: '1 judge; 2 jury; 3 witness; 4 dock.' }
        },
        'history.crime.transport_ship': {
            title: 'Transportation ship cutaway',
            fields: { berthBays: [3, 6, 4] },
            description: 'A conceptual ship cutaway separates main deck, sail structures and selected accommodation bays.',
            limitation:
                '18th\u201319th-century transportation context; not a named vessel, capacity estimate, testimony or exact accommodation plan. Original teaching reconstruction, not an authentic historical source.',
            adaptation:
                'Source-supported accommodation and vessel structure. Choose this only for structural or spatial explanation. Use supplied question intent to select the approved feature or model extent. Counts are illustrative unless separately evidenced; never infer site, date, capacity or event details. Use verified images for authentic source analysis and Mermaid/learning_visual for causal relationships.',
            createdBatch: 'history-completion',
            fieldDescriptions: { berthBays: 'Illustrative below-deck berth bays, not a count of transported people.' }
        },
        'history.american_west.railroad': {
            title: 'Transcontinental railway engineering section',
            fields: { structure: [1, 2, 1] },
            description: 'Two approved railway engineering views distinguish a cutting from a timber trestle.',
            limitation:
                '19th-century engineering models, not actual route or construction measurements. Use maps for the transcontinental route. Original teaching reconstruction, not an authentic historical source.',
            adaptation:
                'Track, cutting and bridge; actual route uses map owner. Choose this only for structural or spatial explanation. Use supplied question intent to select the approved feature or model extent. Counts are illustrative unless separately evidenced; never infer site, date, capacity or event details. Use verified images for authentic source analysis and Mermaid/learning_visual for causal relationships.',
            createdBatch: 'history-completion',
            fieldDescriptions: { structure: '1 cutting cross-section; 2 timber trestle elevation.' }
        },
        'history.american_west.wind_pump': {
            title: 'Homestead wind pump',
            fields: { tankLevel: [0.25, 0.85, 0.45] },
            description: 'A metal windwheel, tower, pump rod and water tank are shown as connected structural parts.',
            limitation:
                'Later-19th-century Great Plains metal-wheel model. Do not apply it indiscriminately to early homesteads or infer flow and efficiency. Original teaching reconstruction, not an authentic historical source.',
            adaptation:
                'Windwheel, pump rod and water tank. Choose this only for structural or spatial explanation. Use supplied question intent to select the approved feature or model extent. Counts are illustrative unless separately evidenced; never infer site, date, capacity or event details. Use verified images for authentic source analysis and Mermaid/learning_visual for causal relationships.',
            createdBatch: 'history-completion',
            fieldDescriptions: { tankLevel: 'Selected water-fill fraction in the tank; no pumping rate is implied.' }
        },
        'history.cold_war.airlift_loading': {
            title: 'Berlin airlift aircraft loading section',
            fields: { cargoUnits: [2, 5, 3] },
            description: 'An aircraft cargo cutaway places packages in a fuselage compartment beside a loading access.',
            limitation:
                'Berlin airlift 1948\u201349 context; generic aircraft shape, not an identified aircraft type or cargo manifest. Original teaching reconstruction, not an authentic historical source.',
            adaptation:
                'Cargo-space illustration; payload data not fabricated. Choose this only for structural or spatial explanation. Use supplied question intent to select the approved feature or model extent. Counts are illustrative unless separately evidenced; never infer site, date, capacity or event details. Use verified images for authentic source analysis and Mermaid/learning_visual for causal relationships.',
            createdBatch: 'history-completion',
            fieldDescriptions: { cargoUnits: 'Selected visible cargo packages, not an aircraft payload or delivery count.' }
        },
        'history.cold_war.missile_site': {
            title: 'Missile-site interpretation plan',
            fields: { focusFeature: [1, 3, 1] },
            description: 'An original plan separates elongated objects, structures and access tracks for a source-recognition exercise.',
            limitation:
                '1962 Cuban Missile Crisis source-study context. This invented layout is not reconnaissance evidence and cannot identify or locate an actual missile site. Original teaching reconstruction, not an authentic historical source.',
            adaptation:
                'Simplified sourced spatial features; no claimed reconnaissance image. Choose this only for structural or spatial explanation. Use supplied question intent to select the approved feature or model extent. Counts are illustrative unless separately evidenced; never infer site, date, capacity or event details. Use verified images for authentic source analysis and Mermaid/learning_visual for causal relationships.',
            createdBatch: 'history-completion',
            fieldDescriptions: { focusFeature: 'Recognition overlay: 1 elongated objects; 2 structures; 3 tracks.' }
        },
        'history.germany.radio': {
            title: 'Radio receiver and propaganda medium',
            fields: { cutaway: [0, 1, 0] },
            description: 'A generic 1930s German receiver distinguishes the speaker area, tuning scale and controls or an internal view.',
            limitation:
                'The object illustrates a medium used for Nazi propaganda; no authentic slogan, circuit specification or source attribution is invented. Original teaching reconstruction, not an authentic historical source.',
            adaptation:
                'Dated object anatomy; no invented authentic slogans. Choose this only for structural or spatial explanation. Use supplied question intent to select the approved feature or model extent. Counts are illustrative unless separately evidenced; never infer site, date, capacity or event details. Use verified images for authentic source analysis and Mermaid/learning_visual for causal relationships.',
            createdBatch: 'history-completion',
            fieldDescriptions: { cutaway: '0 front of receiver; 1 selected internal-component view.' }
        },
        'history.usa.bus_layout': {
            title: 'Montgomery bus segregation model',
            fields: { region: [1, 3, 1] },
            description:
                'A generic Montgomery bus plan identifies front, middle and rear regions for discussion of enforced racial segregation.',
            limitation:
                'Montgomery 1955 context. Seat counts and exact boundaries are illustrative; the model does not locate Rosa Parks\u2019s seat or reproduce bus 2857. Original teaching reconstruction, not an authentic historical source.',
            adaptation:
                'Specific dated source required; distinguish reconstruction from testimony. Choose this only for structural or spatial explanation. Use supplied question intent to select the approved feature or model extent. Counts are illustrative unless separately evidenced; never infer site, date, capacity or event details. Use verified images for authentic source analysis and Mermaid/learning_visual for causal relationships.',
            createdBatch: 'history-completion',
            fieldDescriptions: { region: '1 front; 2 middle; 3 rear spatial region. This is not an exact seat locator.' }
        },
        'english.language.speech_script': {
            title: 'Speech-script annotation',
            fields: { start: [0, 179, 0], end: [1, 180, 6], pauseAfter: [0, 180, 25] },
            description:
                'A supplied speech extract retains its words and punctuation while an emphasis span and pause position are marked.',
            limitation:
                'Pause and emphasis are explicit rehearsal choices. No performance quality or likely audience response is inferred.',
            adaptation:
                'Breath, pause and emphasis over exact supplied words. Use exact supplied text or approved original scene choices for this learning purpose. Preserve learner authorship. This is a teaching illustration, not an authentic exam stimulus, a mark or an inferred interpretation. Use existing media for authentic sources and Mermaid/learning_visual for relationships.',
            createdBatch: 'language-completion',
            fieldDescriptions: { start: 'start', end: 'end', pauseAfter: 'pauseAfter' },
            texts: {
                source: {
                    example: 'We can protect this park. We can begin today.',
                    maxLength: 180,
                    columns: 48,
                    rows: 5,
                    description: 'Exact speech extract with punctuation.'
                }
            }
        },
        'english.language.paragraph_indent': {
            title: 'Paragraph boundary plate',
            fields: { style: [1, 2, 1] },
            description: 'Supplied paragraph boundaries are shown as indented or block paragraphs.',
            limitation: 'The renderer never decides where a paragraph should begin; the passage supplies those boundaries.',
            adaptation:
                'Spatial paragraph breaks and indentation conventions. Use exact supplied text or approved original scene choices for this learning purpose. Preserve learner authorship. This is a teaching illustration, not an authentic exam stimulus, a mark or an inferred interpretation. Use existing media for authentic sources and Mermaid/learning_visual for relationships.',
            createdBatch: 'language-completion',
            fieldDescriptions: { style: '1 indent first lines; 2 block paragraphs with spacing.' },
            texts: {
                source: {
                    example: `The station was empty, apart from one traveller beside the clock.
A light flickered beyond the platform.`,
                    maxLength: 200,
                    columns: 42,
                    rows: 6,
                    description: 'Two or three nonempty paragraphs separated by single newlines.'
                }
            }
        },
        'english.language.dialogue_layout': {
            title: 'Dialogue punctuation layout',
            fields: {},
            description: 'Two explicitly identified speaker turns occupy separate paragraphs with the supplied punctuation preserved.',
            limitation: 'No punctuation is inserted or corrected automatically. Distinct speaker labels are required.',
            adaptation:
                'New speaker lines, quotation marks and punctuation. Use exact supplied text or approved original scene choices for this learning purpose. Preserve learner authorship. This is a teaching illustration, not an authentic exam stimulus, a mark or an inferred interpretation. Use existing media for authentic sources and Mermaid/learning_visual for relationships.',
            createdBatch: 'language-completion',
            fieldDescriptions: {},
            texts: {
                speakerA: { example: 'Anya', maxLength: 12, columns: 12, rows: 1, description: 'First speaker label.' },
                lineA: {
                    example: '\u201CIs anyone there?\u201D she asked.',
                    maxLength: 90,
                    columns: 48,
                    rows: 2,
                    description: 'Exact first spoken paragraph, including punctuation.'
                },
                speakerB: { example: 'Ben', maxLength: 12, columns: 12, rows: 1, description: 'Second speaker label.' },
                lineB: {
                    example: '\u201COnly me,\u201D he replied.',
                    maxLength: 90,
                    columns: 48,
                    rows: 2,
                    description: 'Exact next spoken paragraph, including punctuation.'
                }
            }
        },
        'english.language.word_formation': {
            title: 'Prefix-root-suffix tile plate',
            fields: {},
            description: 'Literal supplied prefix, root and suffix are placed in separate tiles and combined into the supplied word.',
            limitation:
                'Exact concatenation is validated; linguistic validity of the chosen morpheme boundaries still requires teaching judgement.',
            adaptation:
                'Literal word segments; valid morphological examples. Use exact supplied text or approved original scene choices for this learning purpose. Preserve learner authorship. This is a teaching illustration, not an authentic exam stimulus, a mark or an inferred interpretation. Use existing media for authentic sources and Mermaid/learning_visual for relationships.',
            createdBatch: 'language-completion',
            fieldDescriptions: {},
            texts: {
                prefix: {
                    example: 'un',
                    maxLength: 16,
                    columns: 16,
                    rows: 1,
                    description: 'Supplied prefix; empty if absent.',
                    minLength: 0
                },
                root: { example: 'help', maxLength: 16, columns: 16, rows: 1, description: 'Supplied root or base.' },
                suffix: {
                    example: 'ful',
                    maxLength: 16,
                    columns: 16,
                    rows: 1,
                    description: 'Supplied suffix; empty if absent.',
                    minLength: 0
                },
                word: {
                    example: 'unhelpful',
                    maxLength: 28,
                    columns: 28,
                    rows: 1,
                    description: 'Whole supplied word, exactly equal to prefix plus root plus suffix.'
                }
            }
        },
        'english.language.close_reading': {
            title: 'Close-reading margin layout',
            fields: { start: [0, 159, 2], end: [1, 160, 6] },
            description: 'A margin observation is connected to a precise supplied span in the extract.',
            limitation: 'The renderer preserves the source; an interpretation is explicitly supplied, not inferred or marked as correct.',
            adaptation:
                'Exact supplied source extract with bounded margin callouts. Use exact supplied text or approved original scene choices for this learning purpose. Preserve learner authorship. This is a teaching illustration, not an authentic exam stimulus, a mark or an inferred interpretation. Use existing media for authentic sources and Mermaid/learning_visual for relationships.',
            createdBatch: 'language-completion',
            fieldDescriptions: { start: 'start', end: 'end' },
            texts: {
                source: {
                    example: 'A thin ribbon of light slipped beneath the door.',
                    maxLength: 160,
                    columns: 35,
                    rows: 6,
                    description: 'Exact short source passage.'
                },
                annotation: {
                    example: 'Suggests fragility',
                    maxLength: 60,
                    columns: 20,
                    rows: 4,
                    description: 'Supplied observation anchored to the selected words.'
                }
            }
        },
        'english.language.comparison_extract': {
            title: 'Parallel extract annotation',
            fields: { startA: [0, 99, 15], endA: [1, 100, 21], startB: [0, 99, 4], endB: [1, 100, 10] },
            description: 'Two source extracts have independently validated highlights and one supplied comparison.',
            limitation: 'Matching colours or positions do not establish equivalence, causality or authorial intent.',
            adaptation:
                'Two supplied passages with explicit matching highlights. Use exact supplied text or approved original scene choices for this learning purpose. Preserve learner authorship. This is a teaching illustration, not an authentic exam stimulus, a mark or an inferred interpretation. Use existing media for authentic sources and Mermaid/learning_visual for relationships.',
            createdBatch: 'language-completion',
            fieldDescriptions: { startA: 'startA', endA: 'endA', startB: 'startB', endB: 'endB' },
            texts: {
                sourceA: {
                    example: 'The square lay silent beneath the rain.',
                    maxLength: 100,
                    columns: 27,
                    rows: 6,
                    description: 'Exact first passage.'
                },
                sourceB: {
                    example: 'The lively square filled with music.',
                    maxLength: 100,
                    columns: 27,
                    rows: 6,
                    description: 'Exact second passage.'
                },
                annotation: {
                    example: 'Contrasting impressions',
                    maxLength: 42,
                    columns: 42,
                    rows: 1,
                    description: 'Explicit comparison statement, supported by the supplied spans.'
                }
            }
        },
        'english.language.edit_marks': {
            title: 'Editing proof marks',
            fields: { start: [0, 149, 13], end: [1, 150, 22], operation: [1, 2, 1] },
            description:
                'A selected source span remains visible beneath a deletion mark; replacement text is explicitly supplied when chosen.',
            limitation: 'An edit proposal is not automatically applied or assessed. Keep the learner in control of their wording.',
            adaptation:
                'Supplied text and explicitly chosen revisions. Use exact supplied text or approved original scene choices for this learning purpose. Preserve learner authorship. This is a teaching illustration, not an authentic exam stimulus, a mark or an inferred interpretation. Use existing media for authentic sources and Mermaid/learning_visual for relationships.',
            createdBatch: 'language-completion',
            fieldDescriptions: {
                start: 'First character of selected text.',
                end: 'Character immediately after selected text.',
                operation: '1 replace; 2 delete.'
            },
            texts: {
                source: {
                    example: 'The wind was very cold.',
                    maxLength: 150,
                    columns: 50,
                    rows: 4,
                    description: 'Exact wording before the proposed edit.'
                },
                replacement: {
                    example: 'icy',
                    maxLength: 22,
                    columns: 22,
                    rows: 1,
                    description: 'Proposed replacement; empty for deletion.',
                    minLength: 0
                }
            }
        },
        'english.language.proof_sheet': {
            title: 'Page-proof and correction routing',
            fields: { start: [0, 174, 2], end: [1, 175, 8] },
            description: 'Line numbers and an exact span anchor link a margin proposal to a typeset proof.',
            limitation:
                'Line numbers refer to this bounded display layout, not an external exam paper. The original passage is not silently changed.',
            adaptation:
                'Typeset proof with explicit edit anchors; correction symbols stay edit_marks. Use exact supplied text or approved original scene choices for this learning purpose. Preserve learner authorship. This is a teaching illustration, not an authentic exam stimulus, a mark or an inferred interpretation. Use existing media for authentic sources and Mermaid/learning_visual for relationships.',
            createdBatch: 'language-completion',
            fieldDescriptions: { start: 'start', end: 'end' },
            texts: {
                source: {
                    example: 'A narrow path led between the trees.',
                    maxLength: 175,
                    columns: 35,
                    rows: 7,
                    description: 'Exact proof text, with supplied line breaks preserved.'
                },
                replacement: { example: 'winding', maxLength: 48, columns: 16, rows: 4, description: 'Explicit margin revision proposal.' }
            }
        },
        'english.language.interview_layout': {
            title: 'Interview transcript page',
            fields: {},
            description: 'An interview layout separates speaker labels, question, answer and a supplied observation.',
            limitation:
                'Do not invent testimony, pauses or other nonverbal behaviour. These gallery fixtures are original teaching examples.',
            adaptation:
                'Speaker turns, questions, answers and explicit nonverbal notes. Use exact supplied text or approved original scene choices for this learning purpose. Preserve learner authorship. This is a teaching illustration, not an authentic exam stimulus, a mark or an inferred interpretation. Use existing media for authentic sources and Mermaid/learning_visual for relationships.',
            createdBatch: 'language-completion',
            fieldDescriptions: {},
            texts: {
                interviewer: { example: 'Interviewer', maxLength: 12, columns: 12, rows: 1, description: 'First turn speaker.' },
                question: {
                    example: 'What did you notice first?',
                    maxLength: 80,
                    columns: 40,
                    rows: 2,
                    description: 'Exact supplied question.'
                },
                interviewee: { example: 'Guest', maxLength: 12, columns: 12, rows: 1, description: 'Answering speaker.' },
                answer: {
                    example: 'The silence surprised me.',
                    maxLength: 80,
                    columns: 40,
                    rows: 2,
                    description: 'Exact supplied answer.'
                },
                observation: {
                    example: 'A pause before the reply.',
                    maxLength: 42,
                    columns: 42,
                    rows: 1,
                    description: 'Explicit supplied nonverbal observation.'
                }
            }
        },
        'english.language.newspaper': {
            title: 'Newspaper article layout',
            fields: {},
            description:
                'Headline, byline and standfirst sit above two supplied article columns, an image space and supplied caption in a newspaper-layout exercise.',
            limitation: 'Original teaching layout; not evidence of a published article. Text order is supplied explicitly.',
            adaptation:
                'Headline, standfirst, columns, caption and body. Use exact supplied text or approved original scene choices for this learning purpose. Preserve learner authorship. This is a teaching illustration, not an authentic exam stimulus, a mark or an inferred interpretation. Use existing media for authentic sources and Mermaid/learning_visual for relationships.',
            createdBatch: 'language-completion',
            fieldDescriptions: {},
            texts: {
                headline: {
                    example: 'Young volunteers restore local garden',
                    maxLength: 50,
                    columns: 50,
                    rows: 1,
                    description: 'Supplied headline.'
                },
                byline: {
                    example: 'By the school reporting team',
                    maxLength: 44,
                    columns: 44,
                    rows: 1,
                    description: 'Supplied byline; do not fabricate a journalist.'
                },
                standfirst: {
                    example: 'Neighbours create a welcoming green space.',
                    maxLength: 50,
                    columns: 50,
                    rows: 1,
                    description: 'Explicit supplied standfirst.'
                },
                imageCaption: {
                    example: 'Volunteers beside the new beds.',
                    maxLength: 46,
                    columns: 23,
                    rows: 2,
                    description: 'Supplied caption for the empty image space.'
                },
                columnA: {
                    example: 'Volunteers cleared the paths and planted new flowers.',
                    maxLength: 130,
                    columns: 23,
                    rows: 8,
                    description: 'Exact first column excerpt.'
                },
                columnB: {
                    example: 'The organisers hope more neighbours will visit.',
                    maxLength: 60,
                    columns: 23,
                    rows: 3,
                    description: 'Exact second column excerpt.'
                }
            }
        },
        'english.language.magazine': {
            title: 'Magazine feature spread',
            fields: {},
            description: 'A two-page feature spread separates an image space and caption from the supplied article body.',
            limitation: 'The image area is a layout placeholder, not invented photographic evidence. This is not a named publication.',
            adaptation:
                'Layout hierarchy; original sample copy. Use exact supplied text or approved original scene choices for this learning purpose. Preserve learner authorship. This is a teaching illustration, not an authentic exam stimulus, a mark or an inferred interpretation. Use existing media for authentic sources and Mermaid/learning_visual for relationships.',
            createdBatch: 'language-completion',
            fieldDescriptions: {},
            texts: {
                headline: {
                    example: 'A garden for everyone',
                    maxLength: 59,
                    columns: 59,
                    rows: 1,
                    description: 'Supplied spread headline.'
                },
                caption: {
                    example: 'A place to pause and talk.',
                    maxLength: 52,
                    columns: 26,
                    rows: 2,
                    description: 'Supplied caption for an explicitly empty image space.'
                },
                body: {
                    example: 'The narrow paths lead to an open lawn. Benches invite visitors to sit beneath the trees.',
                    maxLength: 130,
                    columns: 26,
                    rows: 6,
                    description: 'Exact feature body extract.'
                }
            }
        },
        'english.language.leaflet_fold': {
            title: 'Folded leaflet layout',
            fields: {},
            description: 'Three supplied panels lie on one flat leaflet face with marked folds.',
            limitation:
                'Panel numbering is for the shown face. The reverse side, fold direction and reading order must be supplied separately.',
            adaptation:
                'Panel order, folds and information hierarchy. Use exact supplied text or approved original scene choices for this learning purpose. Preserve learner authorship. This is a teaching illustration, not an authentic exam stimulus, a mark or an inferred interpretation. Use existing media for authentic sources and Mermaid/learning_visual for relationships.',
            createdBatch: 'language-completion',
            fieldDescriptions: {},
            texts: {
                leftPanel: {
                    example: 'Welcome to the park',
                    maxLength: 72,
                    columns: 18,
                    rows: 5,
                    description: 'Exact content for this flat face panel.'
                },
                middlePanel: {
                    example: 'Explore the paths and ponds.',
                    maxLength: 72,
                    columns: 18,
                    rows: 5,
                    description: 'Exact content for this flat face panel.'
                },
                rightPanel: {
                    example: 'Plan your visit before setting out.',
                    maxLength: 72,
                    columns: 18,
                    rows: 5,
                    description: 'Exact content for this flat face panel.'
                }
            }
        },
        'english.language.poster': {
            title: 'Poster hierarchy plate',
            fields: { imageSubject: [1, 2, 1] },
            description: 'A poster hierarchy pairs a supplied heading and action with an approved original tree or book illustration.',
            limitation: 'A composition exercise; not an authentic campaign or a claim that an event exists.',
            adaptation:
                'Headline, image space and call-to-action layout. Use exact supplied text or approved original scene choices for this learning purpose. Preserve learner authorship. This is a teaching illustration, not an authentic exam stimulus, a mark or an inferred interpretation. Use existing media for authentic sources and Mermaid/learning_visual for relationships.',
            createdBatch: 'language-completion',
            fieldDescriptions: { imageSubject: '1 original tree icon; 2 original open-book icon.' },
            texts: {
                headline: {
                    example: 'Make space for trees',
                    maxLength: 32,
                    columns: 32,
                    rows: 1,
                    description: 'Supplied poster headline.'
                },
                action: { example: 'Join our planting day', maxLength: 60, columns: 30, rows: 2, description: 'Supplied call to action.' }
            }
        },
        'english.language.web_article': {
            title: 'Web-article reading layout',
            fields: {},
            description: 'A browser-like frame demonstrates heading, byline and body hierarchy using supplied text.',
            limitation: 'No URL, live website, publication or screenshot is invented. Use the original page for authentic-source analysis.',
            adaptation:
                'Heading, byline, caption and body hierarchy. Use exact supplied text or approved original scene choices for this learning purpose. Preserve learner authorship. This is a teaching illustration, not an authentic exam stimulus, a mark or an inferred interpretation. Use existing media for authentic sources and Mermaid/learning_visual for relationships.',
            createdBatch: 'language-completion',
            fieldDescriptions: {},
            texts: {
                headline: {
                    example: 'Finding a quiet place to read',
                    maxLength: 48,
                    columns: 48,
                    rows: 1,
                    description: 'Supplied article heading.'
                },
                byline: {
                    example: 'Student magazine feature',
                    maxLength: 45,
                    columns: 45,
                    rows: 1,
                    description: 'Supplied byline or source label.'
                },
                body: {
                    example: 'A comfortable chair and a patch of daylight can transform an unused corner into a welcoming reading space.',
                    maxLength: 150,
                    columns: 46,
                    rows: 5,
                    description: 'Exact body extract.'
                }
            }
        },
        'english.language.advertisement': {
            title: 'Advertisement composition',
            fields: { product: [1, 2, 1] },
            description: 'Image, slogan, body, action and small print occupy distinct zones in an original advertisement layout.',
            limitation:
                'Only supplied claims are displayed. The renderer does not invent prices, benefits, authenticity or persuasion effects.',
            adaptation:
                'Image, slogan, body and small-print zones. Use exact supplied text or approved original scene choices for this learning purpose. Preserve learner authorship. This is a teaching illustration, not an authentic exam stimulus, a mark or an inferred interpretation. Use existing media for authentic sources and Mermaid/learning_visual for relationships.',
            createdBatch: 'language-completion',
            fieldDescriptions: { product: '1 original book object; 2 original bottle object.' },
            texts: {
                slogan: { example: 'A story for every journey', maxLength: 30, columns: 30, rows: 1, description: 'Supplied slogan.' },
                body: {
                    example: 'Discover a new world in the pages of a book.',
                    maxLength: 90,
                    columns: 30,
                    rows: 3,
                    description: 'Supplied advertising copy.'
                },
                action: { example: 'Explore the collection', maxLength: 30, columns: 30, rows: 1, description: 'Supplied action.' },
                smallPrint: {
                    example: 'Original classroom design; no real offer.',
                    maxLength: 56,
                    columns: 56,
                    rows: 1,
                    description: 'Supplied small print.'
                }
            }
        },
        'english.language.public_notice': {
            title: 'Public-notice hierarchy',
            fields: { icon: [1, 2, 1] },
            description: 'A public notice gives the supplied action priority above conditions and detail text.',
            limitation: 'Original layout exercise; not a real official notice. Importance is assigned by the supplied semantic fields.',
            adaptation:
                'Essential action, conditions and location of details. Use exact supplied text or approved original scene choices for this learning purpose. Preserve learner authorship. This is a teaching illustration, not an authentic exam stimulus, a mark or an inferred interpretation. Use existing media for authentic sources and Mermaid/learning_visual for relationships.',
            createdBatch: 'language-completion',
            fieldDescriptions: { icon: '1 information symbol; 2 directional arrow.' },
            texts: {
                action: {
                    example: 'Use the side entrance',
                    maxLength: 40,
                    columns: 40,
                    rows: 1,
                    description: 'Essential action, supplied explicitly.'
                },
                conditions: {
                    example: 'The main doors are closed while repairs take place.',
                    maxLength: 88,
                    columns: 44,
                    rows: 3,
                    description: 'Exact conditions or explanation.'
                },
                details: {
                    example: 'Follow the signs beside the building.',
                    maxLength: 44,
                    columns: 44,
                    rows: 1,
                    description: 'Supplied location or further details.'
                }
            }
        },
        'english.language.instruction_sheet': {
            title: 'Instruction-sheet spatial layout',
            fields: {},
            description: 'Three numbered text items are aligned with small inset-diagram spaces on a sample instruction page.',
            limitation:
                'For procedural teaching use the existing Stepper. This template teaches document arrangement, not correctness of the supplied procedure.',
            adaptation:
                'Numbered text and explicitly linked inset diagrams; procedure owner remains Stepper. Use exact supplied text or approved original scene choices for this learning purpose. Preserve learner authorship. This is a teaching illustration, not an authentic exam stimulus, a mark or an inferred interpretation. Use existing media for authentic sources and Mermaid/learning_visual for relationships.',
            createdBatch: 'language-completion',
            fieldDescriptions: {},
            texts: {
                step1: {
                    example: 'Choose a clear heading.',
                    maxLength: 60,
                    columns: 31,
                    rows: 2,
                    description: 'Exact text for the numbered layout item.'
                },
                step2: {
                    example: 'Place related details together.',
                    maxLength: 60,
                    columns: 31,
                    rows: 2,
                    description: 'Exact text for the numbered layout item.'
                },
                step3: {
                    example: 'Check the final page for clarity.',
                    maxLength: 60,
                    columns: 31,
                    rows: 2,
                    description: 'Exact text for the numbered layout item.'
                }
            }
        },
        'english.language.document_facsimile': {
            title: 'Source-document facsimile frame',
            fields: {},
            description: 'A supplied document excerpt and reference label are framed beside an explicit margin observation.',
            limitation:
                'The parchment-style frame does not authenticate a source or establish its age. Original exam evidence remains with its media/document owner.',
            adaptation:
                'Supplied text boundaries, marginalia and provenance banner. Use exact supplied text or approved original scene choices for this learning purpose. Preserve learner authorship. This is a teaching illustration, not an authentic exam stimulus, a mark or an inferred interpretation. Use existing media for authentic sources and Mermaid/learning_visual for relationships.',
            createdBatch: 'language-completion',
            fieldDescriptions: {},
            texts: {
                reference: {
                    example: 'Supplied extract: classroom example',
                    maxLength: 38,
                    columns: 38,
                    rows: 1,
                    description: 'Supplied reference label; not an authenticity guarantee.'
                },
                source: {
                    example: 'The lane narrowed as it approached the river. Beyond the bridge, the roofs shone in the fading light.',
                    maxLength: 152,
                    columns: 38,
                    rows: 5,
                    description: 'Exact supplied document excerpt.'
                },
                marginNote: { example: 'Setting detail', maxLength: 39, columns: 13, rows: 4, description: 'Supplied marginal annotation.' }
            }
        },
        'english.language.sensory_scene': {
            title: 'Sensory description scene',
            fields: { focus: [1, 3, 1] },
            description: 'A seaside scene identifies one explicit sensory-description stimulus.',
            limitation: 'Visible cues do not prescribe an emotion, sound word or interpretation.',
            adaptation:
                'Concrete scene objects supporting sensory observation. Use exact supplied text or approved original scene choices for this learning purpose. Preserve learner authorship. This is a teaching illustration, not an authentic exam stimulus, a mark or an inferred interpretation. Use existing media for authentic sources and Mermaid/learning_visual for relationships.',
            createdBatch: 'language-completion',
            fieldDescriptions: { focus: '1 water; 2 moving flag; 3 sunlight.' }
        },
        'english.language.viewpoint_scene': {
            title: 'Narrator viewpoint illustration',
            fields: { observer: [1, 2, 1] },
            description: 'A plan view locates two observers around a building and selects a direction of view.',
            limitation: 'The selected observer controls the viewing side; no narrative knowledge is inferred.',
            adaptation:
                'Same event from explicit observer positions. Use exact supplied text or approved original scene choices for this learning purpose. Preserve learner authorship. This is a teaching illustration, not an authentic exam stimulus, a mark or an inferred interpretation. Use existing media for authentic sources and Mermaid/learning_visual for relationships.',
            createdBatch: 'language-completion',
            fieldDescriptions: { observer: '1 observer A; 2 observer B.' }
        },
        'english.language.setting_section': {
            title: 'Setting cross-section for description',
            fields: { raining: [0, 1, 0] },
            description: 'An original interior section shows furniture, a doorway and an explicitly chosen weather state outside.',
            limitation: 'An original writing stimulus, not a location from a named text.',
            adaptation:
                'Original interior/exterior scene with spatial detail. Use exact supplied text or approved original scene choices for this learning purpose. Preserve learner authorship. This is a teaching illustration, not an authentic exam stimulus, a mark or an inferred interpretation. Use existing media for authentic sources and Mermaid/learning_visual for relationships.',
            createdBatch: 'language-completion',
            fieldDescriptions: { raining: '0 dry window view; 1 rain beyond the window.' }
        },
        'english.language.presentation_space': {
            title: 'Presentation positioning plan',
            fields: { audienceRows: [2, 4, 2] },
            description: 'A presentation-room plan locates a speaker, screen and selected audience rows.',
            limitation: 'Counts describe this model only. Use existing widgets for learner response or assessment.',
            adaptation:
                'Speaker, audience and visual-aid sightlines. Use exact supplied text or approved original scene choices for this learning purpose. Preserve learner authorship. This is a teaching illustration, not an authentic exam stimulus, a mark or an inferred interpretation. Use existing media for authentic sources and Mermaid/learning_visual for relationships.',
            createdBatch: 'language-completion',
            fieldDescriptions: { audienceRows: 'Number of illustrative audience rows.' }
        },
        'english.language.editorial_cartoon': {
            title: 'Editorial cartoon composition',
            fields: { object: [1, 2, 1] },
            description: 'An original figure, object and supplied speech balloon demonstrate cartoon composition.',
            limitation: 'It is not an authentic editorial cartoon, political source or attributed quotation.',
            adaptation:
                'Original labelled objects and speech balloons; no invented source attribution. Use exact supplied text or approved original scene choices for this learning purpose. Preserve learner authorship. This is a teaching illustration, not an authentic exam stimulus, a mark or an inferred interpretation. Use existing media for authentic sources and Mermaid/learning_visual for relationships.',
            createdBatch: 'language-completion',
            fieldDescriptions: { object: '1 tree; 2 stack of books.' },
            texts: {
                balloon: {
                    example: 'Where shall we make room?',
                    maxLength: 52,
                    columns: 26,
                    rows: 2,
                    description: 'Exact original speech-balloon text; no fabricated attribution.'
                }
            }
        },
        'english.language.crop_bias': {
            title: 'Image cropping and viewpoint',
            fields: { crop: [1, 2, 1] },
            description: 'A full original scene is placed beside a crop that retains or omits another figure.',
            limitation: 'Cropping changes available context; bias, truth and authorial intent must be argued from evidence.',
            adaptation:
                'Same original scene with crop windows; no fake source photograph. Use exact supplied text or approved original scene choices for this learning purpose. Preserve learner authorship. This is a teaching illustration, not an authentic exam stimulus, a mark or an inferred interpretation. Use existing media for authentic sources and Mermaid/learning_visual for relationships.',
            createdBatch: 'language-completion',
            fieldDescriptions: { crop: '1 retain both figures; 2 isolate one figure.' }
        },
        'english.language.panel_sequence': {
            title: 'Narrative storyboard panels',
            fields: { direction: [1, 2, 1] },
            description: 'Three original spatial storyboard panels show selected actor movement and exact supplied captions.',
            limitation: 'Use Mermaid or Stepper for abstract plot/process sequences; no events are inferred from a literary text.',
            adaptation:
                'Explicit event scenes and transitions; generic plotting stays Mermaid. Use exact supplied text or approved original scene choices for this learning purpose. Preserve learner authorship. This is a teaching illustration, not an authentic exam stimulus, a mark or an inferred interpretation. Use existing media for authentic sources and Mermaid/learning_visual for relationships.',
            createdBatch: 'language-completion',
            fieldDescriptions: { direction: '1 actor approaches the door; 2 actor moves away.' },
            texts: {
                caption1: {
                    example: 'The door ahead.',
                    maxLength: 34,
                    columns: 17,
                    rows: 2,
                    description: 'Exact caption for the corresponding spatial panel.'
                },
                caption2: {
                    example: 'A closer look.',
                    maxLength: 34,
                    columns: 17,
                    rows: 2,
                    description: 'Exact caption for the corresponding spatial panel.'
                },
                caption3: {
                    example: 'At the threshold.',
                    maxLength: 34,
                    columns: 17,
                    rows: 2,
                    description: 'Exact caption for the corresponding spatial panel.'
                }
            }
        },
        'english.language.camera_angle': {
            title: 'Camera-angle viewpoint plate',
            fields: { viewpoint: [1, 3, 1] },
            description: 'A side-view camera and field-of-view wedge show the selected observation height.',
            limitation: 'Qualitative composition model, not measured optics or an asserted emotional effect.',
            adaptation:
                'Observer positions and field of view in one scene. Use exact supplied text or approved original scene choices for this learning purpose. Preserve learner authorship. This is a teaching illustration, not an authentic exam stimulus, a mark or an inferred interpretation. Use existing media for authentic sources and Mermaid/learning_visual for relationships.',
            createdBatch: 'language-completion',
            fieldDescriptions: { viewpoint: '1 low camera; 2 eye-level; 3 high camera.' }
        },
        'english.language.foreground_depth': {
            title: 'Foreground/middle/background composition',
            fields: { plane: [1, 3, 1] },
            description: 'A supplied focus choice marks one depth plane in an original landscape.',
            limitation: 'No real distances or authorial intentions are inferred.',
            adaptation:
                'Depth planes and selected descriptive focus. Use exact supplied text or approved original scene choices for this learning purpose. Preserve learner authorship. This is a teaching illustration, not an authentic exam stimulus, a mark or an inferred interpretation. Use existing media for authentic sources and Mermaid/learning_visual for relationships.',
            createdBatch: 'language-completion',
            fieldDescriptions: { plane: '1 foreground tree; 2 middle-distance building; 3 background hills.' }
        },
        'english.language.object_detail': {
            title: 'Object study with detail insets',
            fields: { detail: [1, 2, 1] },
            description: 'An original key is paired with a selected detail inset for close description.',
            limitation: 'Not a real key, mechanical specification or claim about an object\u2019s history.',
            adaptation:
                'Original object and magnified details for precise description. Use exact supplied text or approved original scene choices for this learning purpose. Preserve learner authorship. This is a teaching illustration, not an authentic exam stimulus, a mark or an inferred interpretation. Use existing media for authentic sources and Mermaid/learning_visual for relationships.',
            createdBatch: 'language-completion',
            fieldDescriptions: { detail: '1 surface marks; 2 key tooth profile.' }
        },
        'english.language.light_direction': {
            title: 'Lighting and mood scene',
            fields: { lightSide: [1, 2, 1] },
            description: 'A simple original still life relates a selected light direction to the opposite cast-shadow direction.',
            limitation: 'Qualitative lighting model; shadow length and mood are not calculated or asserted.',
            adaptation:
                'Light source, shadows and observable details. Use exact supplied text or approved original scene choices for this learning purpose. Preserve learner authorship. This is a teaching illustration, not an authentic exam stimulus, a mark or an inferred interpretation. Use existing media for authentic sources and Mermaid/learning_visual for relationships.',
            createdBatch: 'language-completion',
            fieldDescriptions: { lightSide: '1 light from left; 2 light from right.' }
        },
        'english.language.soundscape': {
            title: 'Sound-source scene',
            fields: { source: [1, 3, 1] },
            description: 'An original spatial scene selects a bell, bird or fountain as a sound source.',
            limitation: 'Wave marks mean selected sound, not frequency, volume or measured evidence. Description remains learner-authored.',
            adaptation:
                'Spatial sources and observer position; effects remain learner-authored. Use exact supplied text or approved original scene choices for this learning purpose. Preserve learner authorship. This is a teaching illustration, not an authentic exam stimulus, a mark or an inferred interpretation. Use existing media for authentic sources and Mermaid/learning_visual for relationships.',
            createdBatch: 'language-completion',
            fieldDescriptions: { source: '1 bell; 2 bird; 3 fountain.' }
        },
        'english.language.character_gesture': {
            title: 'Gesture and posture study',
            fields: { pose: [1, 3, 1] },
            description: 'A neutral figure shows one explicitly selected arm pose.',
            limitation: 'Pose is visible data; emotion, personality and intention are not asserted.',
            adaptation:
                'Explicit body poses; no inferred emotion asserted as fact. Use exact supplied text or approved original scene choices for this learning purpose. Preserve learner authorship. This is a teaching illustration, not an authentic exam stimulus, a mark or an inferred interpretation. Use existing media for authentic sources and Mermaid/learning_visual for relationships.',
            createdBatch: 'language-completion',
            fieldDescriptions: { pose: '1 outstretched arms; 2 raised arms; 3 lowered arms.' }
        },
        'english.language.threshold_scene': {
            title: 'Interior/exterior contrast scene',
            fields: { outsideWeather: [1, 2, 1] },
            description: 'A doorway joins a furnished interior to an explicitly chosen exterior weather state.',
            limitation: 'An original writing stimulus, not a universal symbolic meaning or a scene from a named work.',
            adaptation:
                'Doorway links two explicit settings for description. Use exact supplied text or approved original scene choices for this learning purpose. Preserve learner authorship. This is a teaching illustration, not an authentic exam stimulus, a mark or an inferred interpretation. Use existing media for authentic sources and Mermaid/learning_visual for relationships.',
            createdBatch: 'language-completion',
            fieldDescriptions: { outsideWeather: '1 rain outside; 2 sun outside.' }
        },
        'english.language.unreliable_view': {
            title: 'Restricted sightline illustration',
            fields: { barrier: [1, 2, 1] },
            description: 'A side view distinguishes what an observer can see beyond a selected barrier.',
            limitation:
                'Restricted perception does not by itself make a narrator unreliable. The diagram is omniscient; literary interpretation requires supplied evidence.',
            adaptation:
                'Occlusion and observer knowledge; do not infer author intent. Use exact supplied text or approved original scene choices for this learning purpose. Preserve learner authorship. This is a teaching illustration, not an authentic exam stimulus, a mark or an inferred interpretation. Use existing media for authentic sources and Mermaid/learning_visual for relationships.',
            createdBatch: 'language-completion',
            fieldDescriptions: { barrier: '1 low barrier leaves sightline open; 2 tall barrier blocks it.' }
        },
        'english.language.poster_speech': {
            title: 'Visual-aid and speaker relationship',
            fields: { selectedPanel: [1, 2, 1] },
            description: 'A speaker, visual aid and audience positions show a selected pointing relationship.',
            limitation: 'The supplied panel text is not a learner response or an assessment outcome.',
            adaptation:
                'Speaker position, visual aid and audience sightlines. Use exact supplied text or approved original scene choices for this learning purpose. Preserve learner authorship. This is a teaching illustration, not an authentic exam stimulus, a mark or an inferred interpretation. Use existing media for authentic sources and Mermaid/learning_visual for relationships.',
            createdBatch: 'language-completion',
            fieldDescriptions: { selectedPanel: '1 point towards top panel; 2 point towards bottom panel.' },
            texts: {
                topPanel: { example: 'Our shared space', maxLength: 40, columns: 20, rows: 2, description: 'Exact top-panel text.' },
                bottomPanel: { example: 'Ideas for change', maxLength: 40, columns: 20, rows: 2, description: 'Exact bottom-panel text.' }
            }
        },
        'english.language.discussion_seating': {
            title: 'Discussion seating and turn positions',
            fields: { participants: [3, 8, 5], activeSeat: [1, 8, 2] },
            description: 'A circular seating plan identifies a supplied participant count and explicitly selected speaking turn.',
            limitation:
                'This is a spatial discussion model, not recorded behaviour, proficiency evidence or automated participation scoring.',
            adaptation:
                'Spatial seating; no scoring or invented participation data. Use exact supplied text or approved original scene choices for this learning purpose. Preserve learner authorship. This is a teaching illustration, not an authentic exam stimulus, a mark or an inferred interpretation. Use existing media for authentic sources and Mermaid/learning_visual for relationships.',
            createdBatch: 'language-completion',
            fieldDescriptions: {
                participants: 'Number of model participants, 3\u20138.',
                activeSeat: 'Selected seat number, between 1 and participants.'
            }
        },
        'english.literature.enjambment': {
            title: 'Enjambment line-boundary plate',
            fields: { boundary: [1, 5, 1] },
            description: 'A continuation connector crosses one supplied poetic line break, retaining exact words and lineation.',
            limitation: 'The caller must establish syntactic continuation. Checking for an end-stop is a safeguard, not a grammar parser.',
            adaptation:
                'Supplied sentence runs across a poetic line break. Provide explicit question data and supported choices. Do not guess quotations, character relationships, plot, author intention or source provenance. Use Mermaid/learning_visual for abstract relationships and verified media for authentic stimuli.',
            createdBatch: 'literature-completion',
            fieldDescriptions: { boundary: 'boundary' },
            texts: {
                source: {
                    example: `The narrow path runs on
beyond the sleeping town.`,
                    maxLength: 250,
                    columns: 48,
                    rows: 6,
                    description: 'Exact supplied words; do not invent attribution or textual evidence.'
                }
            }
        },
        'english.literature.caesura': {
            title: 'Caesura placement plate',
            fields: { pauseAfter: [1, 51, 13] },
            description: 'A double bar marks an explicitly chosen internal pause within one exact line.',
            limitation:
                'The line and pause are supplied; caesura need not always coincide with punctuation, and performance readings can vary.',
            adaptation:
                'Internal pause within an exact supplied line. Provide explicit question data and supported choices. Do not guess quotations, character relationships, plot, author intention or source provenance. Use Mermaid/learning_visual for abstract relationships and verified media for authentic stimuli.',
            createdBatch: 'literature-completion',
            fieldDescriptions: { pauseAfter: 'pauseAfter' },
            texts: {
                source: {
                    example: 'The gate shut; the garden held its breath.',
                    maxLength: 52,
                    columns: 52,
                    rows: 1,
                    description: 'Exact supplied words; do not invent attribution or textual evidence.'
                },
                annotation: {
                    example: 'Pause after the semicolon',
                    maxLength: 46,
                    columns: 46,
                    rows: 1,
                    description: 'Exact supplied words; do not invent attribution or textual evidence.'
                }
            }
        },
        'english.literature.metre': {
            title: 'Metrical stress annotation',
            fields: {},
            description:
                'Explicit syllable segments are paired with a supplied stressed/unstressed pattern and shown above the unchanged source line.',
            limitation:
                'This renderer does not infer syllables or scan poetry. Short extracts only; ambiguity and alternative readings belong in the explanation.',
            adaptation:
                'Supplied stress pattern; acknowledge interpretive variation. Provide explicit question data and supported choices. Do not guess quotations, character relationships, plot, author intention or source provenance. Use Mermaid/learning_visual for abstract relationships and verified media for authentic stimuli.',
            createdBatch: 'literature-completion',
            fieldDescriptions: {},
            texts: {
                source: {
                    example: 'the sun will rise',
                    maxLength: 84,
                    columns: 56,
                    rows: 2,
                    description: 'Exact supplied words; do not invent attribution or textual evidence.'
                },
                syllables: {
                    example: 'the |sun |will |rise',
                    maxLength: 95,
                    columns: 95,
                    rows: 1,
                    description: 'Exact supplied words; do not invent attribution or textual evidence.'
                },
                pattern: {
                    example: 'u/u/',
                    maxLength: 12,
                    columns: 12,
                    rows: 1,
                    description: 'Exact supplied words; do not invent attribution or textual evidence.'
                }
            }
        },
        'english.literature.rhyme': {
            title: 'End-rhyme alignment plate',
            fields: {},
            description: 'Exact poem lines keep their endings, with one explicitly supplied rhyme-group marker per line.',
            limitation: 'Rhyme judgments depend on sound, dialect and context; the renderer never infers them from spelling.',
            adaptation:
                'Explicit line-end sounds; not invented phonetic matches. Provide explicit question data and supported choices. Do not guess quotations, character relationships, plot, author intention or source provenance. Use Mermaid/learning_visual for abstract relationships and verified media for authentic stimuli.',
            createdBatch: 'literature-completion',
            fieldDescriptions: {},
            texts: {
                source: {
                    example: `The lantern warmed the quiet night
The window held a patch of light
A bird returned beside the stream
The water stirred a silver dream`,
                    maxLength: 240,
                    columns: 46,
                    rows: 6,
                    description: 'Exact supplied words; do not invent attribution or textual evidence.'
                },
                scheme: {
                    example: 'AABB',
                    maxLength: 6,
                    columns: 6,
                    rows: 1,
                    description: 'Exact supplied words; do not invent attribution or textual evidence.'
                }
            }
        },
        'english.literature.volta': {
            title: 'Volta positioning plate',
            fields: { turnLine: [2, 8, 3] },
            description: 'An explicitly supplied line is highlighted as a proposed turn within the exact extract.',
            limitation:
                'Not an automatic assertion of a volta. The teacher or learner must support the interpretation with the supplied text.',
            adaptation:
                'Supplied turn location; do not infer from line count alone. Provide explicit question data and supported choices. Do not guess quotations, character relationships, plot, author intention or source provenance. Use Mermaid/learning_visual for abstract relationships and verified media for authentic stimuli.',
            createdBatch: 'literature-completion',
            fieldDescriptions: { turnLine: 'turnLine' },
            texts: {
                source: {
                    example: `The lane was dark
The house was still
But through the window
a candle burned.`,
                    maxLength: 300,
                    columns: 48,
                    rows: 8,
                    description: 'Exact supplied words; do not invent attribution or textual evidence.'
                },
                annotation: {
                    example: 'Supplied turn begins with \u201CBut\u201D',
                    maxLength: 49,
                    columns: 49,
                    rows: 1,
                    description: 'Exact supplied words; do not invent attribution or textual evidence.'
                }
            }
        },
        'english.literature.refrain': {
            title: 'Refrain recurrence plate',
            fields: { firstLine: [1, 7, 2], secondLine: [2, 8, 4] },
            description: 'Two ordered and identical supplied lines are highlighted within a short extract.',
            limitation: 'This recognises literal recurrence only, not a paraphrased or varied refrain; effects require textual discussion.',
            adaptation:
                'Exact repeated text positions within supplied stanzas. Provide explicit question data and supported choices. Do not guess quotations, character relationships, plot, author intention or source provenance. Use Mermaid/learning_visual for abstract relationships and verified media for authentic stimuli.',
            createdBatch: 'literature-completion',
            fieldDescriptions: { firstLine: 'firstLine', secondLine: 'secondLine' },
            texts: {
                source: {
                    example: `The evening settles slowly
We carry on
The road bends past the harbour
We carry on`,
                    maxLength: 300,
                    columns: 49,
                    rows: 8,
                    description: 'Exact supplied words; do not invent attribution or textual evidence.'
                }
            }
        },
        'english.literature.free_verse': {
            title: 'Free-verse spatial layout',
            fields: {},
            description: 'An exact source block retains uneven lines, leading spaces and empty stanza lines.',
            limitation: 'Layout alone does not establish that a poem is free verse; rhythm and form require reading. No automatic reflow.',
            adaptation:
                'Faithful supplied line breaks and white space. Provide explicit question data and supported choices. Do not guess quotations, character relationships, plot, author intention or source provenance. Use Mermaid/learning_visual for abstract relationships and verified media for authentic stimuli.',
            createdBatch: 'literature-completion',
            fieldDescriptions: {},
            texts: {
                source: {
                    example: `A leaf
    turns
in the wind

then rests.`,
                    maxLength: 280,
                    columns: 50,
                    rows: 8,
                    description: 'Exact supplied words; do not invent attribution or textual evidence.'
                },
                annotation: {
                    example: 'Lineation and empty line supplied explicitly',
                    maxLength: 50,
                    columns: 50,
                    rows: 1,
                    description: 'Exact supplied words; do not invent attribution or textual evidence.'
                }
            }
        },
        'english.literature.extract_margin': {
            title: 'Extract-to-whole annotation page',
            fields: { start: [0, 159, 2], end: [1, 160, 13] },
            description: 'A precise extract span is anchored to a supplied observation, with a separate whole-text context statement.',
            limitation:
                'Gallery fixtures are original teaching prose. Source attribution and whole-text claims must be grounded in supplied material, not inferred.',
            adaptation:
                'Supplied quotation with bounded callouts; relationships elsewhere. Provide explicit question data and supported choices. Do not guess quotations, character relationships, plot, author intention or source provenance. Use Mermaid/learning_visual for abstract relationships and verified media for authentic stimuli.',
            createdBatch: 'literature-completion',
            fieldDescriptions: { start: 'start', end: 'end' },
            texts: {
                source: {
                    example: 'A small light trembled in the empty room.',
                    maxLength: 160,
                    columns: 35,
                    rows: 6,
                    description: 'Exact supplied words; do not invent attribution or textual evidence.'
                },
                observation: {
                    example: 'A fragile source of hope',
                    maxLength: 60,
                    columns: 20,
                    rows: 4,
                    description: 'Exact supplied words; do not invent attribution or textual evidence.'
                },
                wholeTextContext: {
                    example: 'Supplied context: this image returns later in the story.',
                    maxLength: 59,
                    columns: 59,
                    rows: 1,
                    description: 'Exact supplied words; do not invent attribution or textual evidence.'
                }
            }
        },
        'english.literature.quotation_weave': {
            title: 'Quotation integration plate',
            fields: { start: [0, 199, 14], end: [1, 200, 25] },
            description:
                'The selected words within supplied critical prose are checked against an exact supplied quotation and underlined.',
            limitation: 'The renderer checks literal equality, not quotation authenticity or the quality of an argument.',
            adaptation:
                'Exact textual spans embedded in original critical prose. Provide explicit question data and supported choices. Do not guess quotations, character relationships, plot, author intention or source provenance. Use Mermaid/learning_visual for abstract relationships and verified media for authentic stimuli.',
            createdBatch: 'literature-completion',
            fieldDescriptions: { start: 'start', end: 'end' },
            texts: {
                prose: {
                    example: 'The image of \u201Csmall light\u201D suggests a fragile hope.',
                    maxLength: 200,
                    columns: 54,
                    rows: 4,
                    description: 'Exact supplied words; do not invent attribution or textual evidence.'
                },
                quotation: {
                    example: 'small light',
                    maxLength: 52,
                    columns: 52,
                    rows: 1,
                    description: 'Exact supplied words; do not invent attribution or textual evidence.'
                }
            }
        },
        'english.literature.stanza_space': {
            title: 'Concrete-poetry spatial form',
            fields: { outline: [0, 1, 1] },
            description: 'A concrete-poetry block preserves exact authored words and leading spaces in fixed display cells.',
            limitation:
                'Original supplied layouts only. The renderer does not infer a shape or manufacture positions from an ordinary poem.',
            adaptation:
                'Faithful supplied word positions where shape carries meaning. Provide explicit question data and supported choices. Do not guess quotations, character relationships, plot, author intention or source provenance. Use Mermaid/learning_visual for abstract relationships and verified media for authentic stimuli.',
            createdBatch: 'literature-completion',
            fieldDescriptions: { outline: 'outline' },
            texts: {
                source: {
                    example: `        rain
      rain rain
    rain rain rain
  rain rain rain rain
        falls`,
                    maxLength: 260,
                    columns: 46,
                    rows: 8,
                    description: 'Exact supplied words; do not invent attribution or textual evidence.'
                },
                annotation: {
                    example: 'Supplied words form an original shape',
                    maxLength: 49,
                    columns: 49,
                    rows: 1,
                    description: 'Exact supplied words; do not invent attribution or textual evidence.'
                }
            }
        },
        'english.literature.proscenium': {
            title: 'Proscenium-stage frame',
            fields: { curtain: [1, 2, 1] },
            description: 'A framed stage opening shows either open or closed curtains and a supplied staging label.',
            limitation: 'A conventional theatre-space model, not a claim about the staging of a named literary work.',
            adaptation:
                'Audience boundary and framed stage space. Provide explicit question data and supported choices. Do not guess quotations, character relationships, plot, author intention or source provenance. Use Mermaid/learning_visual for abstract relationships and verified media for authentic stimuli.',
            createdBatch: 'literature-completion',
            fieldDescriptions: { curtain: '1 open; 2 closed.' },
            texts: {
                production: {
                    example: 'Supplied staging exercise',
                    maxLength: 42,
                    columns: 42,
                    rows: 1,
                    description: 'Exact supplied words; do not invent attribution or textual evidence.'
                }
            }
        },
        'english.literature.stage_levels': {
            title: 'Dramatic levels and entrances',
            fields: { level: [1, 2, 1] },
            description: 'An entrance and raised playing level locate one supplied performer at a selected level.',
            limitation: 'Generic set geometry; the model does not invent stage directions or provide construction instructions.',
            adaptation:
                'Explicit blocking and stage directions from supplied text. Provide explicit question data and supported choices. Do not guess quotations, character relationships, plot, author intention or source provenance. Use Mermaid/learning_visual for abstract relationships and verified media for authentic stimuli.',
            createdBatch: 'literature-completion',
            fieldDescriptions: { level: '1 lower playing level; 2 upper level.' },
            texts: {
                character: {
                    example: 'Speaker',
                    maxLength: 12,
                    columns: 12,
                    rows: 1,
                    description: 'Exact supplied words; do not invent attribution or textual evidence.'
                }
            }
        },
        'english.literature.soliloquy': {
            title: 'Soliloquy staging model',
            fields: { position: [1, 2, 1] },
            description: 'A single named speaker occupies one of two approved stage positions and addresses the audience.',
            limitation:
                'This is one soliloquy staging model; the text determines dramatic context and possible presence or awareness of other characters.',
            adaptation:
                'Speaker and audience relationship; text-specific interpretation. Provide explicit question data and supported choices. Do not guess quotations, character relationships, plot, author intention or source provenance. Use Mermaid/learning_visual for abstract relationships and verified media for authentic stimuli.',
            createdBatch: 'literature-completion',
            fieldDescriptions: { position: '1 left position; 2 right position in audience view.' },
            texts: {
                character: {
                    example: 'Speaker',
                    maxLength: 12,
                    columns: 12,
                    rows: 1,
                    description: 'Exact supplied words; do not invent attribution or textual evidence.'
                }
            }
        },
        'english.literature.aside': {
            title: 'Aside staging model',
            fields: { speaker: [1, 2, 1] },
            description: 'Two supplied characters occupy a stage, with one selected to address the audience in an aside convention.',
            limitation:
                'The other character\u2019s conventional non-hearing is a theatrical relationship, not a calculation of physical acoustics.',
            adaptation:
                'Speaker/listener positions; convention not literal acoustics. Provide explicit question data and supported choices. Do not guess quotations, character relationships, plot, author intention or source provenance. Use Mermaid/learning_visual for abstract relationships and verified media for authentic stimuli.',
            createdBatch: 'literature-completion',
            fieldDescriptions: { speaker: '1 nameA; 2 nameB.' },
            texts: {
                nameA: {
                    example: 'Speaker A',
                    maxLength: 12,
                    columns: 12,
                    rows: 1,
                    description: 'Exact supplied words; do not invent attribution or textual evidence.'
                },
                nameB: {
                    example: 'Speaker B',
                    maxLength: 12,
                    columns: 12,
                    rows: 1,
                    description: 'Exact supplied words; do not invent attribution or textual evidence.'
                }
            }
        },
        'english.literature.trapdoor': {
            title: 'Stage trapdoor cross-section',
            fields: { open: [0, 1, 1] },
            description: 'A generic stage cross-section distinguishes the playing floor, a trapdoor and below-stage space.',
            limitation:
                'A conceptual theatre feature, not measured architecture, a construction plan or a claim about a particular production.',
            adaptation:
                'Above/below-stage spaces and entrance route. Provide explicit question data and supported choices. Do not guess quotations, character relationships, plot, author intention or source provenance. Use Mermaid/learning_visual for abstract relationships and verified media for authentic stimuli.',
            createdBatch: 'literature-completion',
            fieldDescriptions: { open: '0 closed; 1 open with an illustrative entrance route.' }
        },
        'english.literature.balcony': {
            title: 'Upper-stage balcony section',
            fields: { rail: [0, 1, 1] },
            description: 'Two named performers occupy upper and lower playing levels, with an optional front rail.',
            limitation: 'Generic staging model; labels and staging must be supported by the question or supplied text.',
            adaptation:
                'Two playing levels with audience sightline. Provide explicit question data and supported choices. Do not guess quotations, character relationships, plot, author intention or source provenance. Use Mermaid/learning_visual for abstract relationships and verified media for authentic stimuli.',
            createdBatch: 'literature-completion',
            fieldDescriptions: { rail: '0 omit front rail; 1 include it.' },
            texts: {
                nameA: {
                    example: 'Upper figure',
                    maxLength: 12,
                    columns: 12,
                    rows: 1,
                    description: 'Exact supplied words; do not invent attribution or textual evidence.'
                },
                nameB: {
                    example: 'Lower figure',
                    maxLength: 12,
                    columns: 12,
                    rows: 1,
                    description: 'Exact supplied words; do not invent attribution or textual evidence.'
                }
            }
        },
        'english.literature.discovery_space': {
            title: 'Discovery-space staging',
            fields: { open: [0, 1, 1] },
            description: 'A curtained recess either reveals or conceals an explicitly labelled performer.',
            limitation: 'A generic staging convention; concealed figure data is supplied, not inferred from a dramatic text.',
            adaptation:
                'Curtained recess and visible/hidden action boundary. Provide explicit question data and supported choices. Do not guess quotations, character relationships, plot, author intention or source provenance. Use Mermaid/learning_visual for abstract relationships and verified media for authentic stimuli.',
            createdBatch: 'literature-completion',
            fieldDescriptions: { open: '0 closed curtains; 1 open curtains.' },
            texts: {
                character: {
                    example: 'Hidden figure',
                    maxLength: 13,
                    columns: 13,
                    rows: 1,
                    description: 'Exact supplied words; do not invent attribution or textual evidence.'
                }
            }
        },
        'english.literature.shadow_screen': {
            title: 'Shadow-screen theatre geometry',
            fields: { objectDistance: [1, 4, 2], screenDistance: [2, 7, 6] },
            description:
                'An ideal point light, opaque object and screen produce a projection calculated from the supplied relative distances.',
            limitation: 'Dimensionless model distances, not theatre measurements. Finite lights and penumbrae are outside this template.',
            adaptation:
                'Light, object and screen alignment. Provide explicit question data and supported choices. Do not guess quotations, character relationships, plot, author intention or source provenance. Use Mermaid/learning_visual for abstract relationships and verified media for authentic stimuli.',
            createdBatch: 'literature-completion',
            fieldDescriptions: {
                objectDistance: 'Relative distance from light to object, integer 1\u20134.',
                screenDistance: 'Relative distance from light to screen, integer 2\u20137, greater than objectDistance.'
            }
        },
        'english.literature.split_stage': {
            title: 'Simultaneous split-stage spaces',
            fields: { litSide: [1, 2, 1] },
            description: 'Two named playing areas and characters remain visible, with a supplied lighting focus on one side.',
            limitation: 'Spatial simultaneity is a supplied staging choice, not an inferred plot relationship.',
            adaptation:
                'Two explicit playing areas and lighting boundary. Provide explicit question data and supported choices. Do not guess quotations, character relationships, plot, author intention or source provenance. Use Mermaid/learning_visual for abstract relationships and verified media for authentic stimuli.',
            createdBatch: 'literature-completion',
            fieldDescriptions: { litSide: '1 left area; 2 right area.' },
            texts: {
                nameA: {
                    example: 'Speaker A',
                    maxLength: 12,
                    columns: 12,
                    rows: 1,
                    description: 'Exact supplied words; do not invent attribution or textual evidence.'
                },
                nameB: {
                    example: 'Speaker B',
                    maxLength: 12,
                    columns: 12,
                    rows: 1,
                    description: 'Exact supplied words; do not invent attribution or textual evidence.'
                },
                placeA: {
                    example: 'Inside the house',
                    maxLength: 24,
                    columns: 24,
                    rows: 1,
                    description: 'Exact supplied words; do not invent attribution or textual evidence.'
                },
                placeB: {
                    example: 'Outside the gate',
                    maxLength: 24,
                    columns: 24,
                    rows: 1,
                    description: 'Exact supplied words; do not invent attribution or textual evidence.'
                }
            }
        },
        'english.literature.groundplan_sightline': {
            title: 'Set design and audience sightlines',
            fields: { scenery: [1, 2, 1] },
            description: 'One audience position looks towards a performer; scenery is placed clear of or across that sightline.',
            limitation: 'A plan-view occlusion model; no quantitative visibility guarantee for a real venue.',
            adaptation:
                'Scenery occlusion, audience and performance space. Provide explicit question data and supported choices. Do not guess quotations, character relationships, plot, author intention or source provenance. Use Mermaid/learning_visual for abstract relationships and verified media for authentic stimuli.',
            createdBatch: 'literature-completion',
            fieldDescriptions: { scenery: '1 clear of sightline; 2 blocking sightline.' }
        },
        'english.literature.light_shadow': {
            title: 'Light and shadow staging',
            fields: { lightSide: [1, 2, 1] },
            description:
                'A selected literal stage-light direction and opposite schematic shadow frame a named performer and explicit observation.',
            limitation: 'Qualitative staging only. Lighting does not prescribe mood, character morality or symbolic meaning.',
            adaptation:
                'Literal scene lighting distinguished from interpretation. Provide explicit question data and supported choices. Do not guess quotations, character relationships, plot, author intention or source provenance. Use Mermaid/learning_visual for abstract relationships and verified media for authentic stimuli.',
            createdBatch: 'literature-completion',
            fieldDescriptions: { lightSide: '1 left; 2 right.' },
            texts: {
                character: {
                    example: 'Performer',
                    maxLength: 13,
                    columns: 13,
                    rows: 1,
                    description: 'Exact supplied words; do not invent attribution or textual evidence.'
                },
                observation: {
                    example: 'Supplied observation: the face catches the light.',
                    maxLength: 49,
                    columns: 49,
                    rows: 1,
                    description: 'Exact supplied words; do not invent attribution or textual evidence.'
                }
            }
        },
        'english.literature.costume': {
            title: 'Character costume study',
            fields: { garment: [1, 2, 1], hat: [0, 1, 1] },
            description: 'A neutral figure wears an approved coat or cloak and optional hat, with an explicit text-supported observation.',
            limitation:
                'Only these broad garment silhouettes are supported. Colour, rank, period and character traits must not be inferred.',
            adaptation:
                'Source-supported costume features; interpretation remains prose. Provide explicit question data and supported choices. Do not guess quotations, character relationships, plot, author intention or source provenance. Use Mermaid/learning_visual for abstract relationships and verified media for authentic stimuli.',
            createdBatch: 'literature-completion',
            fieldDescriptions: { garment: '1 long coat; 2 cloak.', hat: '0 absent; 1 present.' },
            texts: {
                character: {
                    example: 'Figure',
                    maxLength: 13,
                    columns: 13,
                    rows: 1,
                    description: 'Exact supplied words; do not invent attribution or textual evidence.'
                },
                observation: {
                    example: 'Supplied detail: a long coat and a broad hat.',
                    maxLength: 54,
                    columns: 54,
                    rows: 1,
                    description: 'Exact supplied words; do not invent attribution or textual evidence.'
                }
            }
        },
        'english.literature.prop': {
            title: 'Stage prop and handling plate',
            fields: { object: [1, 2, 1], hand: [1, 2, 1] },
            description: 'A named performer holds an approved book or cup prop at one explicitly selected hand.',
            limitation: 'A literal prop-handling illustration; it makes no claim about symbolism, ownership or motive.',
            adaptation:
                'Explicit prop and actor contact points. Provide explicit question data and supported choices. Do not guess quotations, character relationships, plot, author intention or source provenance. Use Mermaid/learning_visual for abstract relationships and verified media for authentic stimuli.',
            createdBatch: 'literature-completion',
            fieldDescriptions: { object: '1 book; 2 cup.', hand: '1 hand at left of audience view; 2 hand at right.' },
            texts: {
                character: {
                    example: 'Performer',
                    maxLength: 13,
                    columns: 13,
                    rows: 1,
                    description: 'Exact supplied words; do not invent attribution or textual evidence.'
                }
            }
        },
        'english.literature.stage_combat': {
            title: 'Dramatic confrontation blocking',
            fields: { spacing: [1, 2, 1] },
            description: 'Two explicitly named performers stand at a selected symbolic separation in a confrontation scene.',
            limitation:
                'Fictional performance composition only; there are no physical combat techniques, tactical directions or real safety distances.',
            adaptation:
                'Fictional performance spacing; no physical combat instructions. Provide explicit question data and supported choices. Do not guess quotations, character relationships, plot, author intention or source provenance. Use Mermaid/learning_visual for abstract relationships and verified media for authentic stimuli.',
            createdBatch: 'literature-completion',
            fieldDescriptions: { spacing: '1 nearer symbolic positions; 2 wider symbolic positions.' },
            texts: {
                nameA: {
                    example: 'Speaker A',
                    maxLength: 12,
                    columns: 12,
                    rows: 1,
                    description: 'Exact supplied words; do not invent attribution or textual evidence.'
                },
                nameB: {
                    example: 'Speaker B',
                    maxLength: 12,
                    columns: 12,
                    rows: 1,
                    description: 'Exact supplied words; do not invent attribution or textual evidence.'
                }
            }
        },
        'english.literature.procession': {
            title: 'Processional scene formation',
            fields: { direction: [1, 2, 1] },
            description: 'Explicitly ordered names determine a procession formation and an approved entrance direction.',
            limitation:
                'A spatial staging sequence, not inferred plot chronology or hierarchy. Abstract event sequences remain with Mermaid/Stepper.',
            adaptation:
                'Explicit character order and entrances from supplied text. Provide explicit question data and supported choices. Do not guess quotations, character relationships, plot, author intention or source provenance. Use Mermaid/learning_visual for abstract relationships and verified media for authentic stimuli.',
            createdBatch: 'literature-completion',
            fieldDescriptions: { direction: '1 towards right entrance; 2 towards left entrance.' },
            texts: {
                order: {
                    example: `Leader
Visitor
Attendant`,
                    maxLength: 64,
                    columns: 12,
                    rows: 5,
                    description: 'Two to five distinct character labels, one per line, leading first.'
                }
            }
        },
        'english.literature.tableau': {
            title: 'Tableau composition',
            fields: { raised: [1, 2, 1] },
            description: 'A static three-person tableau raises one named position while preserving the other figures.',
            limitation: 'Position is explicit; social power, emotion and relationships are not inferred.',
            adaptation:
                'Actor height and position; do not fabricate relationships. Provide explicit question data and supported choices. Do not guess quotations, character relationships, plot, author intention or source provenance. Use Mermaid/learning_visual for abstract relationships and verified media for authentic stimuli.',
            createdBatch: 'literature-completion',
            fieldDescriptions: { raised: '1 nameA on the platform; 2 nameB on the platform.' },
            texts: {
                nameA: {
                    example: 'Speaker A',
                    maxLength: 12,
                    columns: 12,
                    rows: 1,
                    description: 'Exact supplied words; do not invent attribution or textual evidence.'
                },
                nameB: {
                    example: 'Speaker B',
                    maxLength: 12,
                    columns: 12,
                    rows: 1,
                    description: 'Exact supplied words; do not invent attribution or textual evidence.'
                },
                observation: {
                    example: 'Supplied view: Figure A stands above the group.',
                    maxLength: 53,
                    columns: 53,
                    rows: 1,
                    description: 'Exact supplied words; do not invent attribution or textual evidence.'
                }
            }
        },
        'english.literature.scene_setting': {
            title: 'Scene-setting spatial plan',
            fields: { door: [1, 2, 1] },
            description: 'Two rectangular supplied furnishing footprints and one entrance are arranged in a bounded room plan.',
            limitation:
                'Only this simple topology is supported. Labels must describe suitable furnishing footprints; do not fabricate a map of a named text.',
            adaptation:
                'Only explicit locations from a supplied passage. Provide explicit question data and supported choices. Do not guess quotations, character relationships, plot, author intention or source provenance. Use Mermaid/learning_visual for abstract relationships and verified media for authentic stimuli.',
            createdBatch: 'literature-completion',
            fieldDescriptions: { door: '1 entrance on left; 2 entrance on right.' },
            texts: {
                place: {
                    example: 'Supplied room plan',
                    maxLength: 40,
                    columns: 40,
                    rows: 1,
                    description: 'Exact supplied words; do not invent attribution or textual evidence.'
                },
                objectA: {
                    example: 'Table',
                    maxLength: 13,
                    columns: 13,
                    rows: 1,
                    description: 'Exact supplied words; do not invent attribution or textual evidence.'
                },
                objectB: {
                    example: 'Cupboard',
                    maxLength: 20,
                    columns: 20,
                    rows: 1,
                    description: 'Exact supplied words; do not invent attribution or textual evidence.'
                }
            }
        },
        'english.literature.room_symbolism': {
            title: 'Room and symbolic objects',
            fields: { object: [1, 2, 1] },
            description: 'A room contains a selected literal candle or book, alongside a separately supplied tentative interpretation.',
            limitation: 'Objects have no universal symbolic meaning. The reading must be supported by the supplied literary context.',
            adaptation:
                'Explicit textual objects; interpretations supplied separately. Provide explicit question data and supported choices. Do not guess quotations, character relationships, plot, author intention or source provenance. Use Mermaid/learning_visual for abstract relationships and verified media for authentic stimuli.',
            createdBatch: 'literature-completion',
            fieldDescriptions: { object: '1 lit candle; 2 closed book.' },
            texts: {
                interpretation: {
                    example: 'Supplied reading: the candle may suggest fragile hope.',
                    maxLength: 56,
                    columns: 56,
                    rows: 1,
                    description: 'Exact supplied words; do not invent attribution or textual evidence.'
                }
            }
        },
        'english.literature.threshold': {
            title: 'Doorway and threshold motif plate',
            fields: { open: [0, 1, 1] },
            description: 'A selected open or closed doorway divides two explicitly named spaces.',
            limitation: 'A spatial motif illustration, not a universal symbolic claim or evidence of a named location.',
            adaptation:
                'Text-supported spatial contrast; not universal symbolism. Provide explicit question data and supported choices. Do not guess quotations, character relationships, plot, author intention or source provenance. Use Mermaid/learning_visual for abstract relationships and verified media for authentic stimuli.',
            createdBatch: 'literature-completion',
            fieldDescriptions: { open: '0 closed; 1 open.' },
            texts: {
                inside: {
                    example: 'Inside the room',
                    maxLength: 24,
                    columns: 24,
                    rows: 1,
                    description: 'Exact supplied words; do not invent attribution or textual evidence.'
                },
                outside: {
                    example: 'Beyond the doorway',
                    maxLength: 24,
                    columns: 24,
                    rows: 1,
                    description: 'Exact supplied words; do not invent attribution or textual evidence.'
                }
            }
        },
        'english.literature.workhouse': {
            title: 'Victorian workhouse reconstruction',
            fields: { wings: [2, 4, 4] },
            description: 'An abstract institutional courtyard model includes selected ward blocks, entrance and connecting circulation.',
            limitation:
                'Illustrative nineteenth-century context only; workhouse plans varied. This is not a source reconstruction or a named novel location.',
            adaptation:
                'Historical contextual illustration, not a named novel location. Provide explicit question data and supported choices. Do not guess quotations, character relationships, plot, author intention or source provenance. Use Mermaid/learning_visual for abstract relationships and verified media for authentic stimuli.',
            createdBatch: 'literature-completion',
            fieldDescriptions: { wings: 'wings' }
        },
        'english.literature.counting_house': {
            title: 'Victorian counting-house interior',
            fields: { partition: [0, 1, 1] },
            description: 'A generic period office contains a writing desk, ledger, pen, window and optional partition.',
            limitation: 'Original historical-context illustration; no exact building, named character or novel setting is asserted.',
            adaptation:
                'Original period-context scene; textual features supplied explicitly. Provide explicit question data and supported choices. Do not guess quotations, character relationships, plot, author intention or source provenance. Use Mermaid/learning_visual for abstract relationships and verified media for authentic stimuli.',
            createdBatch: 'literature-completion',
            fieldDescriptions: { partition: '0 open room; 1 partitioned work area.' },
            texts: {
                observation: {
                    example: 'Supplied detail: a desk and a separate work area.',
                    maxLength: 55,
                    columns: 55,
                    rows: 1,
                    description: 'Exact supplied words; do not invent attribution or textual evidence.'
                }
            }
        },
        'english.literature.factory': {
            title: 'Industrial factory section',
            fields: { machines: [2, 4, 3] },
            description: 'A schematic industrial section repeats an explicit number of model machines beneath a shared shaft.',
            limitation:
                'Conceptual industrial-context illustration, not an authentic factory survey or evidence about a character\u2019s working conditions.',
            adaptation:
                'Spatial working conditions from verified historical context. Provide explicit question data and supported choices. Do not guess quotations, character relationships, plot, author intention or source provenance. Use Mermaid/learning_visual for abstract relationships and verified media for authentic stimuli.',
            createdBatch: 'literature-completion',
            fieldDescriptions: { machines: 'machines' },
            texts: {
                observation: {
                    example: 'Supplied detail: machinery shares a drive shaft.',
                    maxLength: 53,
                    columns: 53,
                    rows: 1,
                    description: 'Exact supplied words; do not invent attribution or textual evidence.'
                }
            }
        },
        'english.literature.tenement': {
            title: 'Urban tenement section',
            fields: { floors: [2, 3, 3] },
            description: 'An abstract urban dwelling section shows a supplied number of floors with rooms and shared vertical access.',
            limitation:
                'Generic period-context model. Tenement layouts and conditions varied; this is not a named dwelling or a social-data claim.',
            adaptation:
                'Spatial living conditions; no invented claims about characters. Provide explicit question data and supported choices. Do not guess quotations, character relationships, plot, author intention or source provenance. Use Mermaid/learning_visual for abstract relationships and verified media for authentic stimuli.',
            createdBatch: 'literature-completion',
            fieldDescriptions: { floors: 'floors' }
        },
        'english.literature.battlefield': {
            title: 'Poetry battlefield landscape',
            fields: { weather: [1, 2, 1] },
            description: 'An original non-tactical terrain illustration pairs a selected weather state with explicit supplied imagery.',
            limitation:
                'Use only where the text supports these features. Not a real battle location, historical evidence or military plan.',
            adaptation:
                'Generic original terrain supporting supplied poem imagery; no tactical instructions. Provide explicit question data and supported choices. Do not guess quotations, character relationships, plot, author intention or source provenance. Use Mermaid/learning_visual for abstract relationships and verified media for authentic stimuli.',
            createdBatch: 'literature-completion',
            fieldDescriptions: { weather: '1 rain; 2 sunlight.' },
            texts: {
                imagery: {
                    example: 'Supplied imagery: rain and bare branches.',
                    maxLength: 52,
                    columns: 52,
                    rows: 1,
                    description: 'Exact supplied words; do not invent attribution or textual evidence.'
                }
            }
        },
        'english.literature.memorial': {
            title: 'Memorial composition study',
            fields: { form: [1, 2, 1] },
            description: 'An original obelisk or rounded memorial stone holds a supplied short inscription and a wreath.',
            limitation: 'Not an authentic monument or attributed inscription. Real memorial evidence belongs with verified source images.',
            adaptation:
                'Original object study; authentic monument evidence uses verified images. Provide explicit question data and supported choices. Do not guess quotations, character relationships, plot, author intention or source provenance. Use Mermaid/learning_visual for abstract relationships and verified media for authentic stimuli.',
            createdBatch: 'literature-completion',
            fieldDescriptions: { form: '1 obelisk; 2 rounded headstone form.' },
            texts: {
                inscription: {
                    example: 'We remember',
                    maxLength: 24,
                    columns: 8,
                    rows: 3,
                    description: 'Exact supplied words; do not invent attribution or textual evidence.'
                },
                observation: {
                    example: 'Supplied observation: a wreath rests on the stone.',
                    maxLength: 52,
                    columns: 52,
                    rows: 1,
                    description: 'Exact supplied words; do not invent attribution or textual evidence.'
                }
            }
        }
    }
    function re(t, i, e) {
        if (![t, i, e].every(Number.isFinite) || t < 0 || t >= 90 || i < 1 || e < 1) throw new Error('Invalid optical parameters')
        let s = (i * Math.sin((t * Math.PI) / 180)) / e
        if (s > 1) throw new Error('Total internal reflection requires another template')
        return (Math.asin(s) * 180) / Math.PI
    }
    function E(t, i, e) {
        if (![t, i, e].every((r) => Number.isFinite(r) && r > 0) || i + e <= t || t + i <= e || t + e <= i)
            throw new Error('Triangle inequality')
        let s = (i * i + t * t - e * e) / (2 * t),
            a = Math.sqrt(i * i - s * s)
        if (a < Math.max(t, i, e) * 0.12) throw new Error('Triangle too flat to read')
        return { x: s, y: a }
    }
    function oe(t, i) {
        if (!Number.isFinite(t) || !Number.isFinite(i) || t <= 0 || i <= t) throw new Error('Slant length must exceed base radius')
        return { angle: (360 * t) / i, arcLength: 2 * Math.PI * t }
    }
    function le(t, i, e) {
        if (![t, i, e].every((r) => Number.isFinite(r) && r > 0) || e <= Math.abs(t - i) || e >= t + i)
            throw new Error('Circles must overlap in a lens')
        let s = (t * t - i * i + e * e) / (2 * e),
            a = Math.sqrt(t * t - s * s)
        if (a < 0.15 * Math.max(t, i)) throw new Error('Intersection too narrow to read')
        return { x: s, y: a }
    }
    function ce(t, i) {
        let e = (n) => Number(i[n]),
            s = (n, o) => {
                if (!n) throw new Error(o)
            },
            a = (n, o, l, c) => s(e(n) / e(o) >= l && e(n) / e(o) <= c, `${n}/${o} exceeds this template's readable range`),
            r = {
                'math.angle.exterior_polygon': ['sides'],
                'math.geometry.inscribed_polygon': ['sides'],
                'math.geometry.regular_tessellation': ['sides'],
                'math.number.place_value': ['hundreds', 'tens', 'ones'],
                'math.number.double_line': ['steps'],
                'math.algebra.tiles': ['across', 'down'],
                'math.solid.isometric_cubes': ['steps', 'depth'],
                'math.geometry.scale_drawing': ['scale']
            }
        for (let n of r[t] || []) s(Number.isInteger(e(n)), `${n} must be an integer`)
        if (
            (t === 'math.geometry.regular_tessellation' &&
                s([3, 4, 6].includes(e('sides')), 'Regular single-shape tiling supports 3, 4 or 6 sides'),
            t === 'math.transformation.rotation' && s([90, 180, 270].includes(e('turn')), 'Supported turns are 90, 180 and 270 degrees'),
            t === 'math.angle.triangle_sum' && s(e('angleA') + e('angleB') <= 140, 'Third angle must remain readable'),
            t === 'math.area.annulus' && a('innerRadius', 'outerRadius', 0.1, 0.85),
            t === 'math.area.compound_l' &&
                (a('width', 'height', 0.5, 2), a('cutWidth', 'width', 0.2, 0.8), a('cutHeight', 'height', 0.2, 0.8)),
            t === 'math.area.kite' && a('horizontal', 'vertical', 0.4, 2.5),
            t === 'math.volume.cone' && a('height', 'radius', 0.5, 5),
            t === 'math.net.cone' && (oe(e('radius'), e('slant')), a('radius', 'slant', 0.15, 0.85)),
            t === 'math.net.cylinder' && a('height', 'radius', 0.5, 8),
            t === 'math.net.pyramid' && a('slantHeight', 'baseEdge', 0.6, 2),
            t === 'math.net.triangular_prism' && a('length', 'side', 0.5, 4),
            t === 'math.solid.frustum' && a('topRadius', 'bottomRadius', 0.2, 0.8),
            t === 'math.solid.hollow_cylinder' && a('innerRadius', 'outerRadius', 0.2, 0.8),
            t === 'math.circle.equal_tangents' && a('tangentLength', 'radius', 0.75, 2.6),
            t === 'math.geometry.chord_bisector' && a('chordLength', 'radius', 0.6, 1.95),
            t === 'math.locus.fixed_distance_segment' && a('length', 'distance', 0.5, 6),
            t === 'math.transformation.reflection' && (a('width', 'height', 0.4, 2.5), a('gap', 'width', 0.5, 2)),
            t === 'math.construction.perpendicular_bisector' && a('compassRadius', 'length', 0.55, 1.2),
            t === 'math.construction.perpendicular_point' && a('height', 'compassRadius', 0.5, 0.9),
            t === 'math.similarity.paired_triangles' && (a('largeBase', 'smallBase', 1.5, 3), a('smallHeight', 'smallBase', 0.5, 1.4)),
            t === 'math.congruence.triangle_conditions' && a('height', 'base', 0.5, 2),
            t === 'math.trigonometry.non_right')
        ) {
            E(e('c'), e('b'), e('a'))
            let n = [e('a') ** 2, e('b') ** 2, e('c') ** 2].sort((o, l) => o - l)
            s(Math.abs(n[2] - n[0] - n[1]) > 1e-8 * n[2], 'Use the existing right-triangle template for a right triangle'),
                a('a', 'c', 0.5, 1.5),
                a('b', 'c', 0.5, 1.5)
        }
        t === 'math.geometry.triangle_circumcircle' && E(e('base'), e('left'), e('right')),
            t === 'math.geometry.bisected_composite' &&
                (s(e('radius') * 2 < Math.min(e('width'), e('height')), 'Hole must lie inside the rectangle'),
                a('width', 'height', 0.5, 2),
                a('radius', 'height', 0.1, 0.4)),
            t === 'math.geometry.scale_drawing' && a('length', 'width', 0.75, 2),
            (t === 'math.vector.triangle' || t === 'math.vector.parallelogram') && a('first', 'second', 0.5, 2),
            t === 'math.locus.intersection_regions' && (le(e('radiusA'), e('radiusB'), e('separation')), a('radiusA', 'radiusB', 0.6, 1.6)),
            t === 'math.solid.oblique_section' &&
                (a('leftHeight', 'solidHeight', 0.2, 0.8),
                a('rightHeight', 'solidHeight', 0.2, 0.8),
                s(
                    Math.abs(e('leftHeight') - e('rightHeight')) >= e('solidHeight') * 0.1,
                    'An oblique section needs different end heights'
                )),
            t === 'math.solid.orthographic' &&
                (a('stepWidth', 'totalWidth', 0.3, 0.7),
                a('shortHeight', 'tallHeight', 0.3, 0.7),
                a('totalWidth', 'tallHeight', 0.6, 1.5),
                a('depth', 'totalWidth', 0.25, 0.6))
    }
    function de(t, i, e) {
        if (![t, i, e].every(Number.isFinite) || !t || i <= 0 || e <= 0 || Math.abs(i - t) < 1e-8)
            throw new Error('Invalid thin-lens givens')
        let s = (t * i) / (i - t),
            a = (-s / i) * e
        return { imageDistance: s, imageHeight: a, real: s > 0 }
    }
    function Q(t, i, e, s) {
        return { momentum: t * e + i * s, kineticEnergy: (t * e ** 2 + i * s ** 2) / 2 }
    }
    function pe(t, i) {
        let e = (r) => Number(i[r]),
            s = (r, n) => {
                if (!r) throw new Error(n)
            },
            a = (r, n, o, l) => s(e(r) / e(n) >= o && e(r) / e(n) <= l, `${r}/${n} must be between ${o} and ${l}`)
        if (t === 'physics.optics.convex_lens' || t === 'physics.optics.concave_lens') {
            let r = t === 'physics.optics.convex_lens'
            a('objectDistance', 'focalLength', r ? 0.4 : 0.8, 4),
                a('objectHeight', 'focalLength', 0.03, 0.4),
                r &&
                    s(
                        Math.abs(e('objectDistance') / e('focalLength') - 1) >= 0.2 - 1e-10,
                        'Near-focus images exceed this template\u2019s finite drawing area'
                    ),
                de((r ? 1 : -1) * e('focalLength'), e('objectDistance'), e('objectHeight'))
        }
        if (
            (t === 'physics.sound.echo' && e('givenKind') === 2 && s(e('givenValue') <= 5, 'Round-trip echo time supports up to 5 seconds'),
            t === 'physics.moment.lever' && (a('leftDistance', 'rightDistance', 0.5, 2.5), a('leftForce', 'rightForce', 0.25, 4)),
            t === 'physics.elasticity.spring' && a('loadedLength', 'unloadedLength', 1.15, 2.5),
            t === 'physics.pressure.hydraulic' && a('outputArea', 'inputArea', 1.5, 8),
            t === 'physics.pressure.fluid_depth' && a('upperDepth', 'lowerDepth', 0.2, 0.65),
            t === 'physics.momentum.collision')
        ) {
            let r = Q(e('massA'), e('massB'), e('beforeA'), e('beforeB')),
                n = Q(e('massA'), e('massB'), e('afterA'), e('afterB')),
                o = 1e-8
            s(
                Math.abs(r.momentum - n.momentum) <= o * Math.max(1, Math.abs(r.momentum)),
                'Supplied velocities do not conserve momentum in this isolated-system template'
            ),
                s(
                    n.kineticEnergy <= r.kineticEnergy + o * Math.max(1, r.kineticEnergy),
                    'This collision template does not add an internal energy release'
                ),
                s(
                    e('beforeA') > e('beforeB') && e('afterA') <= e('afterB'),
                    'Objects must approach before and separate or move together after'
                )
        }
        t === 'physics.energy.rollercoaster' &&
            s(e('heightB') <= 0.65 * Math.min(e('heightA'), e('heightC')), 'Middle point must be the lower valley in this track layout'),
            t === 'physics.energy.falling_object' && a('currentHeight', 'initialHeight', 0.12, 0.7),
            t === 'physics.thermal.conduction' &&
                s(
                    Math.abs(e('leftTemperature') - e('rightTemperature')) >= 10,
                    'This conduction model needs at least a 10 \xB0C difference'
                ),
            t === 'physics.thermal.convection' &&
                s(e('hotTemperature') >= e('coolTemperature') + 10, 'Warm and cool water must differ by at least 10 \xB0C'),
            t === 'physics.density.displacement' && a('massG', 'volumeCm3', 1.1, 20)
    }
    var ue = {
        'math.area.annulus': { rules: ['outerRadius must exceed innerRadius.', 'innerRadius / outerRadius must be between 0.1 and 0.85.'] },
        'math.area.compound_l': {
            rules: [
                'cutWidth < width and cutHeight < height.',
                'width / height must be between 0.5 and 2.',
                'cutWidth / width and cutHeight / height must be between 0.2 and 0.8.'
            ]
        },
        'math.area.kite': { rules: ['horizontal / vertical must be between 0.4 and 2.5.'] },
        'math.volume.cone': { rules: ['height / radius must be between 0.5 and 5.'] },
        'math.volume.sphere': { rules: [] },
        'math.volume.triangular_prism': { rules: [] },
        'math.net.cuboid': { rules: ['Largest side / smallest side must be at most 8.'] },
        'math.construction.perpendicular_bisector': { rules: ['compassRadius / length must be between .55 and 1.2, inclusive.'] },
        'math.circle.tangent_radius': { rules: [] },
        'math.angle.parallel_transversal': { rules: [] },
        'math.circle.semicircle': { rules: [] },
        'math.circle.cyclic_quadrilateral': { rules: [] },
        'math.circle.angle_centre': { rules: [] },
        'math.construction.angle_bisector': { rules: [] },
        'math.similarity.paired_triangles': {
            rules: [
                'largeBase / smallBase must be between 1.5 and 3, inclusive.',
                'smallHeight / smallBase must be between .5 and 1.4, inclusive.'
            ]
        },
        'math.bearing.three_figure': { rules: [], integers: ['bearing'] },
        'math.net.cylinder': { rules: ['height / radius must be between .5 and 8, inclusive.'] },
        'math.solid.pyramid': { rules: [] },
        'math.number.fraction_strip': { rules: ['shaded must not exceed parts.'], integers: ['parts', 'shaded'] },
        'math.algebra.tiles': { rules: [], integers: ['across', 'down'] },
        'math.angle.triangle_sum': { rules: ['angleA + angleB must be at most 140 degrees.'] },
        'math.angle.exterior_polygon': { rules: [], integers: ['sides'] },
        'math.circle.same_segment': { rules: [] },
        'math.circle.alternate_segment': { rules: [] },
        'math.circle.equal_tangents': { rules: ['tangentLength / radius must be between .75 and 2.6, inclusive.'] },
        'math.locus.fixed_distance_point': { rules: [] },
        'math.locus.fixed_distance_segment': { rules: ['length / distance must be between .5 and 6, inclusive.'] },
        'math.construction.sss_triangle': {
            rules: ['base, left and right must satisfy the triangle inequalities; altitude must be at least 12% of the longest side.']
        },
        'math.congruence.triangle_conditions': { rules: ['height / base must be between .5 and 2, inclusive.'] },
        'math.transformation.reflection': {
            rules: ['width / height must be between .4 and 2.5, inclusive.', 'gap / width must be between .5 and 2, inclusive.']
        },
        'math.transformation.rotation': { rules: [], enums: { turn: [90, 180, 270] }, integers: ['turn'] },
        'math.transformation.enlargement': { rules: [] },
        'math.vector.triangle': {
            rules: [
                'first / second must be between .5 and 2, inclusive.',
                'includedAngle is the anticlockwise turn from the direction of the first vector to the second, not the interior triangle angle.'
            ]
        },
        'math.vector.parallelogram': { rules: ['first / second must be between .5 and 2, inclusive.'] },
        'math.trigonometry.elevation': { rules: [] },
        'math.geometry.chord_bisector': { rules: ['chordLength / radius must be between .6 and 1.95, inclusive.'] },
        'math.geometry.inscribed_polygon': { rules: [], integers: ['sides'] },
        'math.geometry.regular_tessellation': { rules: [], integers: ['sides'], enums: { sides: [3, 4, 6] } },
        'math.construction.perpendicular_point': { rules: ['height / compassRadius must be between .5 and .9, inclusive.'] },
        'math.locus.intersection_regions': {
            rules: [
                'radiusA / radiusB must be between .6 and 1.6, inclusive.',
                'abs(radiusA - radiusB) < separation < radiusA + radiusB. The half-height of the intersection must be at least 15% of the larger radius.'
            ]
        },
        'math.trigonometry.non_right': {
            rules: [
                'a / c must be between .5 and 1.5, inclusive.',
                'b / c must be between .5 and 1.5, inclusive.',
                'a, b and c must satisfy the triangle inequalities; altitude must be at least 12% of the longest side.',
                'Right triangles use the existing right-triangle template.'
            ]
        },
        'math.geometry.triangle_circumcircle': {
            rules: ['base, left and right must satisfy the triangle inequalities; altitude must be at least 12% of the longest side.']
        },
        'math.geometry.bisected_composite': {
            rules: [
                'width / height must be between .5 and 2, inclusive.',
                'radius / height must be between .1 and .4, inclusive.',
                '2 \xD7 radius must be less than both width and height.'
            ]
        },
        'math.geometry.scale_drawing': { rules: ['length / width must be between .75 and 2, inclusive.'], integers: ['scale'] },
        'math.number.double_line': { rules: [], integers: ['steps'] },
        'math.number.place_value': { rules: [], integers: ['hundreds', 'tens', 'ones'] },
        'math.number.integer_counters': { rules: [], integers: ['positive', 'negative'] },
        'math.number.percentage_grid': { rules: [], integers: ['shaded'] },
        'math.net.cone': {
            rules: [
                'radius / slant must be between .15 and .85, inclusive.',
                'slant must exceed radius. Sector arc is computed from radius / slant.'
            ]
        },
        'math.solid.frustum': { rules: ['topRadius / bottomRadius must be between .2 and .8, inclusive.'] },
        'math.solid.hemisphere': { rules: [] },
        'math.solid.hollow_cylinder': { rules: ['innerRadius / outerRadius must be between .2 and .8, inclusive.'] },
        'math.solid.composite': { rules: [] },
        'math.solid.oblique_section': {
            rules: [
                'leftHeight / solidHeight must be between .2 and .8, inclusive.',
                'rightHeight / solidHeight must be between .2 and .8, inclusive.',
                'abs(leftHeight - rightHeight) must be at least 10% of solidHeight.'
            ]
        },
        'math.solid.orthographic': {
            rules: [
                'stepWidth / totalWidth must be between .3 and .7, inclusive.',
                'shortHeight / tallHeight must be between .3 and .7, inclusive.',
                'totalWidth / tallHeight must be between .6 and 1.5, inclusive.',
                'depth / totalWidth must be between .25 and .6, inclusive.'
            ]
        },
        'math.solid.isometric_cubes': { rules: [], integers: ['steps', 'depth'] },
        'math.net.pyramid': { rules: ['slantHeight / baseEdge must be between .6 and 2, inclusive.'] },
        'math.net.tetrahedron': { rules: [] },
        'math.net.triangular_prism': { rules: ['length / side must be between .5 and 4, inclusive.'] },
        'math.trigonometry.three_dimensional': { rules: [] },
        'physics.circuit.measurement': { rules: [], integers: ['focusMeter'], enums: { focusMeter: [1, 2] } },
        'physics.circuit.potential_divider': { rules: [] },
        'physics.electricity.plug': {
            rules: [],
            integers: ['fuseAmps', 'focusPart'],
            enums: { fuseAmps: [3, 13], focusPart: [1, 2, 3, 4, 5] }
        },
        'physics.electricity.transformer': { rules: [], integers: ['primaryTurns', 'secondaryTurns'] },
        'physics.magnet.bar_field': { rules: [], integers: ['northEnd', 'showCompass'], enums: { northEnd: [-1, 1], showCompass: [0, 1] } },
        'physics.electromagnet.solenoid': { rules: [], integers: ['northEnd', 'turns'], enums: { northEnd: [-1, 1] } },
        'physics.motor.simple': { rules: [], integers: ['focusPart'], enums: { focusPart: [1, 2, 3] } },
        'physics.generator.alternator': { rules: [], integers: ['focusPart'], enums: { focusPart: [1, 2] } },
        'physics.optics.convex_lens': {
            rules: [
                'objectDistance / focalLength must be from 0.4 to 4, excluding values within 0.2 of 1.',
                'objectHeight / focalLength must be between 0.03 and 0.4.'
            ]
        },
        'physics.optics.concave_lens': {
            rules: ['objectDistance / focalLength must be between 0.8 and 4.', 'objectHeight / focalLength must be between 0.03 and 0.4.']
        },
        'physics.optics.prism': { rules: [] },
        'physics.wave.longitudinal': { rules: [], integers: ['periods'] },
        'physics.sound.echo': {
            rules: ['givenKind 2 (round-trip seconds) supports at most 5 s.'],
            integers: ['givenKind'],
            enums: { givenKind: [1, 2] }
        },
        'physics.moment.lever': { rules: ['leftDistance / rightDistance: 0.5 to 2.5; leftForce / rightForce: 0.25 to 4.'] },
        'physics.elasticity.spring': { rules: ['loadedLength / unloadedLength must be between 1.15 and 2.5.'] },
        'physics.pressure.hydraulic': { rules: ['outputArea / inputArea must be between 1.5 and 8.'] },
        'physics.pressure.fluid_depth': { rules: ['upperDepth / lowerDepth must be between 0.2 and 0.65.'] },
        'physics.force.action_reaction': { rules: [], integers: ['interaction'], enums: { interaction: [1, 2] } },
        'physics.force.incline': { rules: [], integers: ['showFriction'], enums: { showFriction: [0, 1] } },
        'physics.force.centre_mass': {
            rules: [],
            integers: ['shape', 'showIntersection'],
            enums: { shape: [1, 2], showIntersection: [0, 1] }
        },
        'physics.momentum.collision': {
            rules: [
                'All before/after velocities are explicit givens. Momentum must be conserved and kinetic energy must not increase.',
                'beforeA > beforeB and afterA <= afterB: approach before, separation or shared velocity after.'
            ]
        },
        'physics.space.orbit': {
            rules: [],
            integers: ['clockwise', 'positionDegrees'],
            enums: { clockwise: [-1, 1], positionDegrees: [0, 45, 90, 135, 180, 225, 270, 315] }
        },
        'physics.energy.rollercoaster': {
            rules: ['heightB <= 0.65 \xD7 min(heightA, heightC).'],
            integers: ['carAt'],
            enums: { carAt: [1, 2, 3] }
        },
        'physics.energy.falling_object': { rules: ['currentHeight / initialHeight must be between 0.12 and 0.7.'] },
        'physics.thermal.conduction': { rules: ['Absolute end-temperature difference must be at least 10 \xB0C.'] },
        'physics.thermal.convection': {
            rules: ['hotTemperature must exceed coolTemperature by at least 10 \xB0C.'],
            integers: ['heaterSide'],
            enums: { heaterSide: [-1, 1] }
        },
        'physics.energy.insulated_wall': { rules: [], integers: ['insulationType'], enums: { insulationType: [0, 1, 2] } },
        'physics.thermal.specific_heat': { rules: [] },
        'physics.density.displacement': { rules: ['massG / volumeCm3 must be between 1.1 and 20: a sinking solid in water.'] },
        'physics.nuclear.radiation_penetration': { rules: [] },
        'physics.nuclear.fission': { rules: [], integers: ['channel'], enums: { channel: [1, 2] } },
        'physics.nuclear.fusion': { rules: [], integers: ['channel', 'showKey'], enums: { channel: [1, 2], showKey: [0, 1] } },
        'physics.electrostatic.point_field': { rules: [], integers: ['sign'], enums: { sign: [-1, 1] } },
        'physics.optics.refraction': {
            rules: ['n1 \xD7 sin(incidence) / n2 must not exceed 1; total internal reflection is not this template.']
        },
        'chemistry.apparatus.filtration': { rules: ['Quantities support at most three decimal places.'], integers: ['residueParticles'] },
        'chemistry.apparatus.distillation': { rules: ['Quantities support at most three decimal places.'] },
        'chemistry.analysis.chromatography': {
            rules: [
                'Quantities support at most three decimal places.',
                'Each spot distance is no more than 0.92 times the front distance, retaining room for visible spots.'
            ]
        },
        'chemistry.apparatus.water_displacement': { rules: ['Quantities support at most three decimal places.'] },
        'chemistry.apparatus.crystallisation': {
            rules: [
                'Quantities support at most three decimal places.',
                'Evaporation stage requires crystals=0; the cooling view may show 0\u20138 illustrative crystals.'
            ],
            integers: ['stage', 'crystals'],
            enums: { stage: [1, 2] }
        },
        'chemistry.apparatus.fractionation': {
            rules: ['Quantities support at most three decimal places.'],
            integers: ['focusOutlet'],
            enums: { focusOutlet: [1, 2, 3, 4, 5] }
        },
        'chemistry.apparatus.separating_funnel': { rules: ['Quantities support at most three decimal places.'] },
        'chemistry.apparatus.reflux': { rules: ['Quantities support at most three decimal places.'] },
        'chemistry.apparatus.titration': { rules: ['Quantities support at most three decimal places.'] },
        'chemistry.apparatus.gas_syringe': { rules: ['Quantities support at most three decimal places.'] },
        'chemistry.apparatus.calorimeter': { rules: ['Quantities support at most three decimal places.'] },
        'chemistry.apparatus.balance_closed': { rules: ['Quantities support at most three decimal places.'] },
        'chemistry.apparatus.meniscus': {
            rules: [
                'Quantities support at most three decimal places.',
                'upperMl must exceed lowerMl; readingMl must lie between them. Scale endpoints are whole mL.'
            ],
            integers: ['lowerMl', 'upperMl']
        },
        'chemistry.apparatus.volumetric_flask': {
            rules: ['Quantities support at most three decimal places.'],
            integers: ['capacityMl', 'fillState'],
            enums: { capacityMl: [25, 50, 100, 250, 500, 1e3], fillState: [-1, 0, 1] }
        },
        'chemistry.apparatus.pipette': {
            rules: ['Quantities support at most three decimal places.'],
            integers: ['capacityMl', 'fillState'],
            enums: { capacityMl: [5, 10, 20, 25, 50], fillState: [-1, 0, 1] }
        },
        'chemistry.bonding.metallic': {
            rules: ['Quantities support at most three decimal places.'],
            integers: ['columns', 'metal', 'showDrift'],
            enums: { metal: [0, 1, 2, 3], showDrift: [0, 1] }
        },
        'chemistry.bonding.ionic_lattice': {
            rules: ['Quantities support at most three decimal places.'],
            integers: ['salt', 'columns'],
            enums: { salt: [1, 2, 3] }
        },
        'chemistry.structure.diamond': {
            rules: ['Quantities support at most three decimal places.'],
            integers: ['showNeighbours', 'highlightBond'],
            enums: { showNeighbours: [0, 1], highlightBond: [1, 2, 3, 4] }
        },
        'chemistry.structure.graphite': {
            rules: ['Quantities support at most three decimal places.', 'highlightLayer must not exceed layers.'],
            integers: ['layers', 'sliding', 'highlightLayer'],
            enums: { layers: [2, 3], sliding: [0, 1] }
        },
        'chemistry.structure.graphene': {
            rules: ['Quantities support at most three decimal places.'],
            integers: ['columns', 'showElectrons'],
            enums: { showElectrons: [0, 1] }
        },
        'chemistry.structure.polymer_packing': {
            rules: ['Quantities support at most three decimal places.'],
            integers: ['chains', 'branching', 'crosslinks'],
            enums: { branching: [0, 1], crosslinks: [0, 1] }
        },
        'chemistry.material.alloy': { rules: ['Quantities support at most three decimal places.'], integers: ['addedAtoms'] },
        'chemistry.reaction.collision': {
            rules: ['Quantities support at most three decimal places.'],
            integers: ['orientation', 'showOutcome'],
            enums: { orientation: [1, 2], showOutcome: [0, 1] }
        },
        'chemistry.reaction.catalyst_surface': { rules: ['Quantities support at most three decimal places.'], integers: ['occupiedSites'] },
        'chemistry.particle.dissolving': { rules: ['Quantities support at most three decimal places.'], integers: ['pairs'] },
        'chemistry.particle.diffusion': { rules: ['Quantities support at most three decimal places.'], integers: ['particles'] },
        'chemistry.particle.conservation': { rules: ['Quantities support at most three decimal places.'], integers: ['units'] },
        'chemistry.particle.surface_area': {
            rules: ['Quantities support at most three decimal places.'],
            integers: ['divisions'],
            enums: { divisions: [2, 3] }
        },
        'chemistry.environment.greenhouse': {
            rules: ['Quantities support at most three decimal places.'],
            integers: ['gas', 'showReflection'],
            enums: { gas: [1, 2, 3], showReflection: [0, 1] }
        },
        'chemistry.material.corrosion': {
            rules: ['Quantities support at most three decimal places.'],
            integers: ['days', 'wetTubeRust'],
            enums: { wetTubeRust: [0, 1] }
        },
        'chemistry.resource.water_filter': {
            rules: ['Quantities support at most three decimal places.', 'sandCm/gravelCm must lie between 1 and 5.']
        },
        'chemistry.atom.isotopes': {
            rules: [
                'Quantities support at most three decimal places.',
                'Masses must differ and belong to the approved isotope list for atomicNumber. Supported H1\u20133, He3\u20134, Li6\u20137, B10\u201311, C12\u201314, N14\u201315, O16\u201318, Ne20\u201322, Mg24\u201326, Si28\u201330, S32/33/34/36, Cl35/37.'
            ],
            integers: ['atomicNumber', 'leftMass', 'rightMass'],
            enums: { atomicNumber: [1, 2, 3, 5, 6, 7, 8, 10, 12, 14, 16, 17] }
        },
        'chemistry.apparatus.bunsen': {
            rules: ['Quantities support at most three decimal places.'],
            integers: ['airHoleOpen'],
            enums: { airHoleOpen: [0, 1] }
        },
        'chemistry.apparatus.electrolysis': {
            rules: ['Quantities support at most three decimal places.'],
            integers: ['cathodeSide', 'ionPairs'],
            enums: { cathodeSide: [-1, 1] }
        },
        'chemistry.analysis.flame_test': {
            rules: ['Quantities support at most three decimal places.'],
            integers: ['observedColour'],
            enums: { observedColour: [1, 2, 3, 4, 5] }
        },
        'chemistry.analysis.gas_test': {
            rules: ['Quantities support at most three decimal places.'],
            integers: ['testKind', 'sampleNumber'],
            enums: { testKind: [1, 2, 3] }
        },
        'biology.cell.microscope': {
            rules: ['Quantities support at most three decimal places.'],
            integers: ['eyepiece', 'objective', 'focusPart'],
            enums: { eyepiece: [5, 10, 15], objective: [4, 10, 40] }
        },
        'biology.cell.mitosis': {
            rules: ['Quantities support at most three decimal places.'],
            integers: ['stage', 'chromosomes'],
            enums: { stage: [1, 2, 3], chromosomes: [2, 4, 6] }
        },
        'biology.cell.sperm': {
            rules: ['Quantities support at most three decimal places.'],
            integers: ['focusPart', 'tailBend'],
            enums: { tailBend: [-1, 1] }
        },
        'biology.cell.red_blood': {
            rules: ['Quantities support at most three decimal places.'],
            integers: ['focusPart'],
            enums: { focusPart: [1, 2] }
        },
        'biology.cell.ciliated': {
            rules: ['Quantities support at most three decimal places.'],
            integers: ['cells', 'particles', 'mucusDirection'],
            enums: { mucusDirection: [-1, 1] }
        },
        'biology.cell.yeast': {
            rules: ['Quantities support at most three decimal places.', 'focusPart=4 requires budStage greater than zero.'],
            integers: ['budStage', 'focusPart'],
            enums: { budStage: [0, 1, 2] }
        },
        'biology.plant.leaf_section': {
            rules: ['Quantities support at most three decimal places.'],
            integers: ['palisadeRows', 'focusLayer']
        },
        'biology.plant.stomata': {
            rules: ['Quantities support at most three decimal places.'],
            integers: ['open', 'chloroplastMarks'],
            enums: { open: [0, 1] }
        },
        'biology.plant.root_hair': {
            rules: ['Quantities support at most three decimal places.'],
            integers: ['uptake'],
            enums: { uptake: [1, 2] }
        },
        'biology.plant.transport_tissues': {
            rules: ['Quantities support at most three decimal places.'],
            integers: ['sugarDirection'],
            enums: { sugarDirection: [-1, 1] }
        },
        'biology.plant.potometer': { rules: ['Quantities support at most three decimal places.'] },
        'biology.plant.photosynthesis_apparatus': {
            rules: ['Quantities support at most three decimal places.'],
            integers: ['bubbleMarks']
        },
        'biology.plant.stem_section': { rules: ['Quantities support at most three decimal places.'], integers: ['bundles', 'focusTissue'] },
        'biology.organ.villus': { rules: ['Quantities support at most three decimal places.'], integers: ['focusPart'] },
        'biology.organ.alveolus': { rules: ['Quantities support at most three decimal places.'], integers: ['focusPart'] },
        'biology.organ.blood_vessels': { rules: ['Quantities support at most three decimal places.'], integers: ['focusVessel'] },
        'biology.organ.heart': {
            rules: ['Quantities support at most three decimal places.'],
            integers: ['focusCircuit', 'showValves'],
            enums: { focusCircuit: [1, 2], showValves: [0, 1] }
        },
        'biology.organ.digestive': { rules: ['Quantities support at most three decimal places.'], integers: ['focusPart'] },
        'biology.organ.eye': {
            rules: ['Quantities support at most three decimal places.'],
            integers: ['nearFocus', 'showRays'],
            enums: { nearFocus: [0, 1], showRays: [0, 1] }
        },
        'biology.organ.kidney': { rules: ['Quantities support at most three decimal places.'], integers: ['focusPart'] },
        'biology.organ.nephron': { rules: ['Quantities support at most three decimal places.'], integers: ['focusRegion'] },
        'biology.membrane.osmosis': {
            rules: ['Quantities support at most three decimal places.'],
            integers: ['leftSolute', 'rightSolute']
        },
        'biology.membrane.active_transport': {
            rules: [
                'Quantities support at most three decimal places.',
                'inside must exceed outside; this template depicts inward transport against the gradient.'
            ],
            integers: ['outside', 'inside']
        },
        'biology.enzyme.active_site': {
            rules: ['Quantities support at most three decimal places.'],
            integers: ['substrateShape', 'state'],
            enums: { substrateShape: [1, 2], state: [0, 1, 2] }
        },
        'biology.immune.phagocyte': { rules: ['Quantities support at most three decimal places.'], integers: ['bacteria', 'focusPart'] },
        'biology.immune.antibody': {
            rules: ['Quantities support at most three decimal places.'],
            integers: ['antigenShape', 'bound'],
            enums: { antigenShape: [1, 2], bound: [0, 1] }
        },
        'biology.neural.neurone': {
            rules: ['Quantities support at most three decimal places.'],
            integers: ['myelinSegments', 'focusPart']
        },
        'biology.neural.reflex': { rules: ['Quantities support at most three decimal places.'], integers: ['focusPart'] },
        'biology.genetics.dna': { rules: ['Quantities support at most three decimal places.'], integers: ['b1', 'b2', 'b3', 'b4'] },
        'biology.genetics.chromosome': {
            rules: [
                'Quantities support at most three decimal places.',
                'Allele symbols use one Latin letter followed by up to two Latin letters, digits, + or -. Each paired locus starts with the same letter ignoring case. Distinct loci must start with different letters.'
            ],
            integers: ['focusLocus']
        },
        'biology.ecology.quadrat': {
            rules: ['Quantities support at most three decimal places.'],
            integers: ['topLeft', 'topRight', 'bottomLeft', 'bottomRight']
        },
        'biology.ecology.transect': {
            rules: ['Quantities support at most three decimal places.', 'boundaryM must lie from 0 to four times spacingM, inclusive.'],
            integers: ['count1', 'count2', 'count3', 'count4', 'count5']
        },
        'biology.respiration.respirometer': { rules: ['Quantities support at most three decimal places.'] },
        'biology.homeostasis.skin': {
            rules: ['Quantities support at most three decimal places.'],
            integers: ['warm', 'focusPart'],
            enums: { warm: [0, 1] }
        },
        'biology.ecology.pooter': { rules: ['Quantities support at most three decimal places.'], integers: ['specimens'] },
        'geography.tectonic.subduction': {
            rules: ['Quantities support at most three decimal places; orbital eccentricity supports four.']
        },
        'geography.tectonic.constructive': {
            rules: ['Quantities support at most three decimal places; orbital eccentricity supports four.'],
            integers: ['setting'],
            enums: { setting: [1, 2] }
        },
        'geography.tectonic.conservative': {
            rules: ['Quantities support at most three decimal places; orbital eccentricity supports four.'],
            integers: ['leftMotion'],
            enums: { leftMotion: [-1, 1] }
        },
        'geography.tectonic.volcano': {
            rules: ['Quantities support at most three decimal places; orbital eccentricity supports four.'],
            integers: ['layers', 'erupting'],
            enums: { erupting: [0, 1] }
        },
        'geography.hazard.earthquake': { rules: ['Quantities support at most three decimal places; orbital eccentricity supports four.'] },
        'geography.weather.tropical_storm': {
            rules: ['Quantities support at most three decimal places; orbital eccentricity supports four.']
        },
        'geography.weather.front': {
            rules: ['Quantities support at most three decimal places; orbital eccentricity supports four.'],
            integers: ['frontType'],
            enums: { frontType: [1, 2] }
        },
        'geography.weather.relief_rain': {
            rules: ['Quantities support at most three decimal places; orbital eccentricity supports four.']
        },
        'geography.weather.air_pressure': {
            rules: ['Quantities support at most three decimal places; orbital eccentricity supports four.'],
            integers: ['high'],
            enums: { high: [0, 1] }
        },
        'geography.weather.convection_rain': {
            rules: ['Quantities support at most three decimal places; orbital eccentricity supports four.']
        },
        'geography.climate.orbit_variation': {
            rules: ['Quantities support at most three decimal places; orbital eccentricity supports four.']
        },
        'geography.river.meander': {
            rules: ['Quantities support at most three decimal places; orbital eccentricity supports four.'],
            integers: ['bendStrength'],
            enums: { bendStrength: [1, 2, 3] }
        },
        'geography.river.waterfall': { rules: ['Quantities support at most three decimal places; orbital eccentricity supports four.'] },
        'geography.river.oxbow': {
            rules: ['Quantities support at most three decimal places; orbital eccentricity supports four.'],
            integers: ['stage'],
            enums: { stage: [1, 2, 3] }
        },
        'geography.river.drainage_basin': {
            rules: ['Quantities support at most three decimal places; orbital eccentricity supports four.'],
            integers: ['tributaries']
        },
        'geography.river.levee': { rules: ['Quantities support at most three decimal places; orbital eccentricity supports four.'] },
        'geography.river.hard_management': {
            rules: ['Quantities support at most three decimal places; orbital eccentricity supports four.']
        },
        'geography.river.soft_management': {
            rules: ['Quantities support at most three decimal places; orbital eccentricity supports four.'],
            integers: ['flooded'],
            enums: { flooded: [0, 1] }
        },
        'geography.coast.spit': { rules: ['Quantities support at most three decimal places; orbital eccentricity supports four.'] },
        'geography.coast.headland_bay': { rules: ['Quantities support at most three decimal places; orbital eccentricity supports four.'] },
        'geography.coast.arch_stack': {
            rules: ['Quantities support at most three decimal places; orbital eccentricity supports four.'],
            integers: ['stage'],
            enums: { stage: [1, 2, 3] }
        },
        'geography.coast.wave_platform': {
            rules: ['Quantities support at most three decimal places; orbital eccentricity supports four.']
        },
        'geography.coast.management': {
            rules: ['Quantities support at most three decimal places; orbital eccentricity supports four.'],
            integers: ['defence'],
            enums: { defence: [1, 2] }
        },
        'geography.glacial.corrie': {
            rules: ['Quantities support at most three decimal places; orbital eccentricity supports four.'],
            integers: ['icePresent'],
            enums: { icePresent: [0, 1] }
        },
        'geography.glacial.valley': { rules: ['Quantities support at most three decimal places; orbital eccentricity supports four.'] },
        'geography.glacial.moraine': {
            rules: ['Quantities support at most three decimal places; orbital eccentricity supports four.'],
            integers: ['focusDeposit']
        },
        'geography.glacial.freeze_thaw': {
            rules: ['Quantities support at most three decimal places; orbital eccentricity supports four.'],
            integers: ['frozen'],
            enums: { frozen: [0, 1] }
        },
        'geography.ecosystem.rainforest': {
            rules: ['Quantities support at most three decimal places; orbital eccentricity supports four.'],
            integers: ['canopyTrees']
        },
        'geography.ecosystem.desert_plant': {
            rules: ['Quantities support at most three decimal places; orbital eccentricity supports four.'],
            integers: ['focusPart']
        },
        'geography.ecosystem.nutrient_stores': {
            rules: ['Quantities support at most three decimal places; orbital eccentricity supports four.'],
            integers: ['focusStore']
        },
        'geography.desert.dune': { rules: ['Quantities support at most three decimal places; orbital eccentricity supports four.'] },
        'geography.desert.water_table': { rules: ['Quantities support at most three decimal places; orbital eccentricity supports four.'] },
        'geography.urban.land_use': {
            rules: ['Quantities support at most three decimal places; orbital eccentricity supports four.'],
            integers: ['centralBlocks']
        },
        'geography.fieldwork.river_measurement': {
            rules: ['Quantities support at most three decimal places; orbital eccentricity supports four.']
        },
        'geography.skills.contour_section': {
            rules: [
                'Quantities support at most three decimal places; orbital eccentricity supports four.',
                'highest contour = baseM + (contours-1)*intervalM; summitM must be between highest + 0.5*intervalM and highest + intervalM.'
            ],
            integers: ['contours']
        },
        'geography.urban.sustainable_drainage': {
            rules: ['Quantities support at most three decimal places; orbital eccentricity supports four.'],
            integers: ['wet'],
            enums: { wet: [0, 1] }
        },
        'geography.energy.hydropower': { rules: ['Quantities support at most three decimal places; orbital eccentricity supports four.'] },
        'geography.fieldwork.beach_profile': {
            rules: ['Quantities support at most three decimal places; orbital eccentricity supports four.']
        },
        'history.norman.motte_bailey': {
            rules: [
                'This unpublished reconstruction requires historical subject review before production generation.',
                'No arbitrary date, site name, historical attribution, invented quotation, raw drawing coordinates or remote resource instructions.',
                'Selected model extent is not a claim about a real site or object.'
            ],
            integers: ['baileyBuildings']
        },
        'history.medieval.monastery': {
            rules: [
                'This unpublished reconstruction requires historical subject review before production generation.',
                'No arbitrary date, site name, historical attribution, invented quotation, raw drawing coordinates or remote resource instructions.',
                'Selected model extent is not a claim about a real site or object.'
            ],
            integers: ['garden'],
            enums: { garden: [0, 1] }
        },
        'history.norman.stone_keep': {
            rules: [
                'This unpublished reconstruction requires historical subject review before production generation.',
                'No arbitrary date, site name, historical attribution, invented quotation, raw drawing coordinates or remote resource instructions.',
                'Selected model extent is not a claim about a real site or object.'
            ],
            integers: ['floors']
        },
        'history.norman.gatehouse': {
            rules: [
                'This unpublished reconstruction requires historical subject review before production generation.',
                'No arbitrary date, site name, historical attribution, invented quotation, raw drawing coordinates or remote resource instructions.',
                'Selected model extent is not a claim about a real site or object.'
            ],
            integers: ['gateRaised'],
            enums: { gateRaised: [0, 1] }
        },
        'history.medieval.open_field': {
            rules: [
                'This unpublished reconstruction requires historical subject review before production generation.',
                'No arbitrary date, site name, historical attribution, invented quotation, raw drawing coordinates or remote resource instructions.',
                'Selected model extent is not a claim about a real site or object.'
            ],
            integers: ['strips']
        },
        'history.medieval.manor': {
            rules: [
                'This unpublished reconstruction requires historical subject review before production generation.',
                'No arbitrary date, site name, historical attribution, invented quotation, raw drawing coordinates or remote resource instructions.',
                'Selected model extent is not a claim about a real site or object.'
            ],
            integers: ['mill'],
            enums: { mill: [0, 1] }
        },
        'history.medieval.church': {
            rules: [
                'This unpublished reconstruction requires historical subject review before production generation.',
                'No arbitrary date, site name, historical attribution, invented quotation, raw drawing coordinates or remote resource instructions.',
                'Selected model extent is not a claim about a real site or object.'
            ],
            integers: ['transepts'],
            enums: { transepts: [0, 1] }
        },
        'history.medieval.town': {
            rules: [
                'This unpublished reconstruction requires historical subject review before production generation.',
                'No arbitrary date, site name, historical attribution, invented quotation, raw drawing coordinates or remote resource instructions.',
                'Selected model extent is not a claim about a real site or object.'
            ],
            integers: ['marketStalls']
        },
        'history.medicine.herb_garden': {
            rules: [
                'This unpublished reconstruction requires historical subject review before production generation.',
                'No arbitrary date, site name, historical attribution, invented quotation, raw drawing coordinates or remote resource instructions.',
                'Selected model extent is not a claim about a real site or object.'
            ],
            integers: ['beds']
        },
        'history.medicine.galen_anatomy': {
            rules: [
                'This unpublished reconstruction requires historical subject review before production generation.',
                'No arbitrary date, site name, historical attribution, invented quotation, raw drawing coordinates or remote resource instructions.',
                'Selected model extent is not a claim about a real site or object.'
            ],
            integers: ['model'],
            enums: { model: [1, 2] }
        },
        'history.medicine.harvey_circulation': {
            rules: [
                'This unpublished reconstruction requires historical subject review before production generation.',
                'No arbitrary date, site name, historical attribution, invented quotation, raw drawing coordinates or remote resource instructions.',
                'Selected model extent is not a claim about a real site or object.'
            ],
            integers: ['valveDetail'],
            enums: { valveDetail: [0, 1] }
        },
        'history.medicine.pasteur_flask': {
            rules: [
                'This unpublished reconstruction requires historical subject review before production generation.',
                'No arbitrary date, site name, historical attribution, invented quotation, raw drawing coordinates or remote resource instructions.',
                'Selected model extent is not a claim about a real site or object.'
            ],
            integers: ['neckIntact'],
            enums: { neckIntact: [0, 1] }
        },
        'history.public_health.cholera_pump': {
            rules: [
                'This unpublished reconstruction requires historical subject review before production generation.',
                'No arbitrary date, site name, historical attribution, invented quotation, raw drawing coordinates or remote resource instructions.',
                'Selected model extent is not a claim about a real site or object.'
            ],
            integers: ['contaminated'],
            enums: { contaminated: [0, 1] }
        },
        'history.public_health.sewer': {
            rules: [
                'This unpublished reconstruction requires historical subject review before production generation.',
                'No arbitrary date, site name, historical attribution, invented quotation, raw drawing coordinates or remote resource instructions.',
                'Selected model extent is not a claim about a real site or object.'
            ],
            integers: ['showOutfall'],
            enums: { showOutfall: [0, 1] }
        },
        'history.medicine.penicillin_plate': {
            rules: [
                'This unpublished reconstruction requires historical subject review before production generation.',
                'No arbitrary date, site name, historical attribution, invented quotation, raw drawing coordinates or remote resource instructions.',
                'Selected model extent is not a claim about a real site or object.'
            ],
            integers: ['inhibitionRegion'],
            enums: { inhibitionRegion: [1, 2] }
        },
        'history.crime.panopticon': {
            rules: [
                'This unpublished reconstruction requires historical subject review before production generation.',
                'No arbitrary date, site name, historical attribution, invented quotation, raw drawing coordinates or remote resource instructions.',
                'Selected model extent is not a claim about a real site or object.'
            ],
            integers: ['cellSectors']
        },
        'history.crime.separate_prison': {
            rules: [
                'This unpublished reconstruction requires historical subject review before production generation.',
                'No arbitrary date, site name, historical attribution, invented quotation, raw drawing coordinates or remote resource instructions.',
                'Selected model extent is not a claim about a real site or object.'
            ],
            integers: ['cellPairs']
        },
        'history.crime.police_equipment': {
            rules: [
                'This unpublished reconstruction requires historical subject review before production generation.',
                'No arbitrary date, site name, historical attribution, invented quotation, raw drawing coordinates or remote resource instructions.',
                'Selected model extent is not a claim about a real site or object.'
            ],
            integers: ['object'],
            enums: { object: [1, 2, 3] }
        },
        'history.american_west.tipi': {
            rules: [
                'This unpublished reconstruction requires historical subject review before production generation.',
                'No arbitrary date, site name, historical attribution, invented quotation, raw drawing coordinates or remote resource instructions.',
                'Selected model extent is not a claim about a real site or object.'
            ],
            integers: ['cutaway'],
            enums: { cutaway: [0, 1] }
        },
        'history.american_west.wagon': {
            rules: [
                'This unpublished reconstruction requires historical subject review before production generation.',
                'No arbitrary date, site name, historical attribution, invented quotation, raw drawing coordinates or remote resource instructions.',
                'Selected model extent is not a claim about a real site or object.'
            ],
            integers: ['crates']
        },
        'history.american_west.sod_house': {
            rules: [
                'This unpublished reconstruction requires historical subject review before production generation.',
                'No arbitrary date, site name, historical attribution, invented quotation, raw drawing coordinates or remote resource instructions.',
                'Selected model extent is not a claim about a real site or object.'
            ],
            integers: ['wallCourses']
        },
        'history.cold_war.berlin_wall': {
            rules: [
                'This unpublished reconstruction requires historical subject review before production generation.',
                'No arbitrary date, site name, historical attribution, invented quotation, raw drawing coordinates or remote resource instructions.',
                'Selected model extent is not a claim about a real site or object.'
            ],
            integers: ['focusPart'],
            enums: { focusPart: [1, 2, 3] }
        },
        'history.source.printing_press': {
            rules: [
                'This unpublished reconstruction requires historical subject review before production generation.',
                'No arbitrary date, site name, historical attribution, invented quotation, raw drawing coordinates or remote resource instructions.',
                'Selected model extent is not a claim about a real site or object.'
            ],
            integers: ['pressOpen'],
            enums: { pressOpen: [0, 1] }
        },
        'history.medicine.barber_surgeon': {
            rules: [
                'This unpublished reconstruction requires historical subject review before production generation.',
                'No arbitrary date, site name, historical attribution, invented quotation, raw drawing coordinates or remote resource instructions.',
                'Selected model extent is not a claim about a real site or object.'
            ],
            integers: ['instrument'],
            enums: { instrument: [1, 2, 3] }
        },
        'history.medicine.anaesthetic_inhaler': {
            rules: [
                'This unpublished reconstruction requires historical subject review before production generation.',
                'No arbitrary date, site name, historical attribution, invented quotation, raw drawing coordinates or remote resource instructions.',
                'Selected model extent is not a claim about a real site or object.'
            ],
            integers: ['cutaway'],
            enums: { cutaway: [0, 1] }
        },
        'history.medicine.lister_spray': {
            rules: [
                'This unpublished reconstruction requires historical subject review before production generation.',
                'No arbitrary date, site name, historical attribution, invented quotation, raw drawing coordinates or remote resource instructions.',
                'Selected model extent is not a claim about a real site or object.'
            ],
            integers: ['focusPart'],
            enums: { focusPart: [1, 2, 3] }
        },
        'history.medicine.xray_room': {
            rules: [
                'This unpublished reconstruction requires historical subject review before production generation.',
                'No arbitrary date, site name, historical attribution, invented quotation, raw drawing coordinates or remote resource instructions.',
                'Selected model extent is not a claim about a real site or object.'
            ],
            integers: ['beamOverlay'],
            enums: { beamOverlay: [0, 1] }
        },
        'history.medicine.hospital_pavilion': {
            rules: [
                'This unpublished reconstruction requires historical subject review before production generation.',
                'No arbitrary date, site name, historical attribution, invented quotation, raw drawing coordinates or remote resource instructions.',
                'Selected model extent is not a claim about a real site or object.'
            ],
            integers: ['bedPairs']
        },
        'history.medicine.operating_theatre': {
            rules: [
                'This unpublished reconstruction requires historical subject review before production generation.',
                'No arbitrary date, site name, historical attribution, invented quotation, raw drawing coordinates or remote resource instructions.',
                'Selected model extent is not a claim about a real site or object.'
            ],
            integers: ['tiers']
        },
        'history.crime.treadwheel': {
            rules: [
                'This unpublished reconstruction requires historical subject review before production generation.',
                'No arbitrary date, site name, historical attribution, invented quotation, raw drawing coordinates or remote resource instructions.',
                'Selected model extent is not a claim about a real site or object.'
            ],
            integers: ['partitions']
        },
        'history.crime.courtroom': {
            rules: [
                'This unpublished reconstruction requires historical subject review before production generation.',
                'No arbitrary date, site name, historical attribution, invented quotation, raw drawing coordinates or remote resource instructions.',
                'Selected model extent is not a claim about a real site or object.'
            ],
            integers: ['focusRole'],
            enums: { focusRole: [1, 2, 3, 4] }
        },
        'history.crime.transport_ship': {
            rules: [
                'This unpublished reconstruction requires historical subject review before production generation.',
                'No arbitrary date, site name, historical attribution, invented quotation, raw drawing coordinates or remote resource instructions.',
                'Selected model extent is not a claim about a real site or object.'
            ],
            integers: ['berthBays']
        },
        'history.american_west.railroad': {
            rules: [
                'This unpublished reconstruction requires historical subject review before production generation.',
                'No arbitrary date, site name, historical attribution, invented quotation, raw drawing coordinates or remote resource instructions.',
                'Selected model extent is not a claim about a real site or object.'
            ],
            integers: ['structure'],
            enums: { structure: [1, 2] }
        },
        'history.american_west.wind_pump': {
            rules: [
                'This unpublished reconstruction requires historical subject review before production generation.',
                'No arbitrary date, site name, historical attribution, invented quotation, raw drawing coordinates or remote resource instructions.',
                'Selected model extent is not a claim about a real site or object.',
                'tankLevel is a supplied/selected fill fraction with at most three decimal places.'
            ]
        },
        'history.cold_war.airlift_loading': {
            rules: [
                'This unpublished reconstruction requires historical subject review before production generation.',
                'No arbitrary date, site name, historical attribution, invented quotation, raw drawing coordinates or remote resource instructions.',
                'Selected model extent is not a claim about a real site or object.'
            ],
            integers: ['cargoUnits']
        },
        'history.cold_war.missile_site': {
            rules: [
                'This unpublished reconstruction requires historical subject review before production generation.',
                'No arbitrary date, site name, historical attribution, invented quotation, raw drawing coordinates or remote resource instructions.',
                'Selected model extent is not a claim about a real site or object.'
            ],
            integers: ['focusFeature'],
            enums: { focusFeature: [1, 2, 3] }
        },
        'history.germany.radio': {
            rules: [
                'This unpublished reconstruction requires historical subject review before production generation.',
                'No arbitrary date, site name, historical attribution, invented quotation, raw drawing coordinates or remote resource instructions.',
                'Selected model extent is not a claim about a real site or object.'
            ],
            integers: ['cutaway'],
            enums: { cutaway: [0, 1] }
        },
        'history.usa.bus_layout': {
            rules: [
                'This unpublished reconstruction requires historical subject review before production generation.',
                'No arbitrary date, site name, historical attribution, invented quotation, raw drawing coordinates or remote resource instructions.',
                'Selected model extent is not a claim about a real site or object.'
            ],
            integers: ['region'],
            enums: { region: [1, 2, 3] }
        },
        'english.language.sentence_spans': {
            integers: ['start', 'end'],
            rules: [
                'All text and annotations must be supplied explicitly; the renderer does not infer grammar, intention, emotion or literary effects.',
                'Text limits include readable line capacity. Overlong input is rejected, never silently truncated.',
                'Text-span offsets are zero-based Unicode characters: start inclusive, end exclusive.'
            ]
        },
        'english.language.speech_script': {
            integers: ['start', 'end', 'pauseAfter'],
            rules: [
                'All text and annotations must be supplied explicitly; the renderer does not infer grammar, intention, emotion or literary effects.',
                'Text limits include readable line capacity. Overlong input is rejected, never silently truncated.',
                'Text-span offsets are zero-based Unicode characters: start inclusive, end exclusive.',
                'pauseAfter must be at a word or punctuation boundary in the supplied source.'
            ]
        },
        'english.language.paragraph_indent': {
            integers: ['style'],
            rules: [
                'All text and annotations must be supplied explicitly; the renderer does not infer grammar, intention, emotion or literary effects.',
                'Text limits include readable line capacity. Overlong input is rejected, never silently truncated.',
                'Text-span offsets are zero-based Unicode characters: start inclusive, end exclusive.',
                'Supply exactly two or three nonempty paragraphs; total wrapped lines at most six.'
            ],
            enums: { style: [1, 2] }
        },
        'english.language.dialogue_layout': {
            integers: [],
            rules: [
                'All text and annotations must be supplied explicitly; the renderer does not infer grammar, intention, emotion or literary effects.',
                'Text limits include readable line capacity. Overlong input is rejected, never silently truncated.',
                'Text-span offsets are zero-based Unicode characters: start inclusive, end exclusive.'
            ]
        },
        'english.language.word_formation': {
            integers: [],
            rules: [
                'All text and annotations must be supplied explicitly; the renderer does not infer grammar, intention, emotion or literary effects.',
                'Text limits include readable line capacity. Overlong input is rejected, never silently truncated.',
                'Text-span offsets are zero-based Unicode characters: start inclusive, end exclusive.',
                'prefix + root + suffix must equal word exactly. At least one affix is required.'
            ]
        },
        'english.language.close_reading': {
            integers: ['start', 'end'],
            rules: [
                'All text and annotations must be supplied explicitly; the renderer does not infer grammar, intention, emotion or literary effects.',
                'Text limits include readable line capacity. Overlong input is rejected, never silently truncated.',
                'Text-span offsets are zero-based Unicode characters: start inclusive, end exclusive.'
            ]
        },
        'english.language.comparison_extract': {
            integers: ['startA', 'endA', 'startB', 'endB'],
            rules: [
                'All text and annotations must be supplied explicitly; the renderer does not infer grammar, intention, emotion or literary effects.',
                'Text limits include readable line capacity. Overlong input is rejected, never silently truncated.',
                'Text-span offsets are zero-based Unicode characters: start inclusive, end exclusive.'
            ]
        },
        'english.language.edit_marks': {
            integers: ['start', 'end', 'operation'],
            rules: [
                'All text and annotations must be supplied explicitly; the renderer does not infer grammar, intention, emotion or literary effects.',
                'Text limits include readable line capacity. Overlong input is rejected, never silently truncated.',
                'Text-span offsets are zero-based Unicode characters: start inclusive, end exclusive.',
                'For replacement, replacement must be nonempty; for deletion, replacement must be empty.'
            ],
            enums: { operation: [1, 2] }
        },
        'english.language.proof_sheet': {
            integers: ['start', 'end'],
            rules: [
                'All text and annotations must be supplied explicitly; the renderer does not infer grammar, intention, emotion or literary effects.',
                'Text limits include readable line capacity. Overlong input is rejected, never silently truncated.',
                'Text-span offsets are zero-based Unicode characters: start inclusive, end exclusive.'
            ]
        },
        'english.language.interview_layout': {
            integers: [],
            rules: [
                'All text and annotations must be supplied explicitly; the renderer does not infer grammar, intention, emotion or literary effects.',
                'Text limits include readable line capacity. Overlong input is rejected, never silently truncated.',
                'Text-span offsets are zero-based Unicode characters: start inclusive, end exclusive.'
            ]
        },
        'english.language.formal_letter': {
            integers: [],
            rules: [
                'All text and annotations must be supplied explicitly; the renderer does not infer grammar, intention, emotion or literary effects.',
                'Text limits include readable line capacity. Overlong input is rejected, never silently truncated.',
                'Text-span offsets are zero-based Unicode characters: start inclusive, end exclusive.'
            ]
        },
        'english.language.newspaper': {
            integers: [],
            rules: [
                'All text and annotations must be supplied explicitly; the renderer does not infer grammar, intention, emotion or literary effects.',
                'Text limits include readable line capacity. Overlong input is rejected, never silently truncated.',
                'Text-span offsets are zero-based Unicode characters: start inclusive, end exclusive.'
            ]
        },
        'english.language.magazine': {
            integers: [],
            rules: [
                'All text and annotations must be supplied explicitly; the renderer does not infer grammar, intention, emotion or literary effects.',
                'Text limits include readable line capacity. Overlong input is rejected, never silently truncated.',
                'Text-span offsets are zero-based Unicode characters: start inclusive, end exclusive.'
            ]
        },
        'english.language.leaflet_fold': {
            integers: [],
            rules: [
                'All text and annotations must be supplied explicitly; the renderer does not infer grammar, intention, emotion or literary effects.',
                'Text limits include readable line capacity. Overlong input is rejected, never silently truncated.',
                'Text-span offsets are zero-based Unicode characters: start inclusive, end exclusive.'
            ]
        },
        'english.language.poster': {
            integers: ['imageSubject'],
            rules: [
                'All text and annotations must be supplied explicitly; the renderer does not infer grammar, intention, emotion or literary effects.',
                'Text limits include readable line capacity. Overlong input is rejected, never silently truncated.',
                'Text-span offsets are zero-based Unicode characters: start inclusive, end exclusive.'
            ],
            enums: { imageSubject: [1, 2] }
        },
        'english.language.web_article': {
            integers: [],
            rules: [
                'All text and annotations must be supplied explicitly; the renderer does not infer grammar, intention, emotion or literary effects.',
                'Text limits include readable line capacity. Overlong input is rejected, never silently truncated.',
                'Text-span offsets are zero-based Unicode characters: start inclusive, end exclusive.'
            ]
        },
        'english.language.advertisement': {
            integers: ['product'],
            rules: [
                'All text and annotations must be supplied explicitly; the renderer does not infer grammar, intention, emotion or literary effects.',
                'Text limits include readable line capacity. Overlong input is rejected, never silently truncated.',
                'Text-span offsets are zero-based Unicode characters: start inclusive, end exclusive.'
            ],
            enums: { product: [1, 2] }
        },
        'english.language.public_notice': {
            integers: ['icon'],
            rules: [
                'All text and annotations must be supplied explicitly; the renderer does not infer grammar, intention, emotion or literary effects.',
                'Text limits include readable line capacity. Overlong input is rejected, never silently truncated.',
                'Text-span offsets are zero-based Unicode characters: start inclusive, end exclusive.'
            ],
            enums: { icon: [1, 2] }
        },
        'english.language.instruction_sheet': {
            integers: [],
            rules: [
                'All text and annotations must be supplied explicitly; the renderer does not infer grammar, intention, emotion or literary effects.',
                'Text limits include readable line capacity. Overlong input is rejected, never silently truncated.',
                'Text-span offsets are zero-based Unicode characters: start inclusive, end exclusive.'
            ]
        },
        'english.language.document_facsimile': {
            integers: [],
            rules: [
                'All text and annotations must be supplied explicitly; the renderer does not infer grammar, intention, emotion or literary effects.',
                'Text limits include readable line capacity. Overlong input is rejected, never silently truncated.',
                'Text-span offsets are zero-based Unicode characters: start inclusive, end exclusive.'
            ]
        },
        'english.language.focus_frame': {
            integers: ['focus'],
            rules: [
                'All text and annotations must be supplied explicitly; the renderer does not infer grammar, intention, emotion or literary effects.',
                'Text limits include readable line capacity. Overlong input is rejected, never silently truncated.',
                'Text-span offsets are zero-based Unicode characters: start inclusive, end exclusive.'
            ],
            enums: { focus: [1, 2, 3] }
        },
        'english.language.sensory_scene': {
            integers: ['focus'],
            rules: [
                'All text and annotations must be supplied explicitly; the renderer does not infer grammar, intention, emotion or literary effects.',
                'Text limits include readable line capacity. Overlong input is rejected, never silently truncated.',
                'Text-span offsets are zero-based Unicode characters: start inclusive, end exclusive.'
            ],
            enums: { focus: [1, 2, 3] }
        },
        'english.language.viewpoint_scene': {
            integers: ['observer'],
            rules: [
                'All text and annotations must be supplied explicitly; the renderer does not infer grammar, intention, emotion or literary effects.',
                'Text limits include readable line capacity. Overlong input is rejected, never silently truncated.',
                'Text-span offsets are zero-based Unicode characters: start inclusive, end exclusive.'
            ],
            enums: { observer: [1, 2] }
        },
        'english.language.setting_section': {
            integers: ['raining'],
            rules: [
                'All text and annotations must be supplied explicitly; the renderer does not infer grammar, intention, emotion or literary effects.',
                'Text limits include readable line capacity. Overlong input is rejected, never silently truncated.',
                'Text-span offsets are zero-based Unicode characters: start inclusive, end exclusive.'
            ],
            enums: { raining: [0, 1] }
        },
        'english.language.presentation_space': {
            integers: ['audienceRows'],
            rules: [
                'All text and annotations must be supplied explicitly; the renderer does not infer grammar, intention, emotion or literary effects.',
                'Text limits include readable line capacity. Overlong input is rejected, never silently truncated.',
                'Text-span offsets are zero-based Unicode characters: start inclusive, end exclusive.'
            ],
            enums: { audienceRows: [2, 3, 4] }
        },
        'english.language.editorial_cartoon': {
            integers: ['object'],
            rules: [
                'All text and annotations must be supplied explicitly; the renderer does not infer grammar, intention, emotion or literary effects.',
                'Text limits include readable line capacity. Overlong input is rejected, never silently truncated.',
                'Text-span offsets are zero-based Unicode characters: start inclusive, end exclusive.'
            ],
            enums: { object: [1, 2] }
        },
        'english.language.crop_bias': {
            integers: ['crop'],
            rules: [
                'All text and annotations must be supplied explicitly; the renderer does not infer grammar, intention, emotion or literary effects.',
                'Text limits include readable line capacity. Overlong input is rejected, never silently truncated.',
                'Text-span offsets are zero-based Unicode characters: start inclusive, end exclusive.'
            ],
            enums: { crop: [1, 2] }
        },
        'english.language.panel_sequence': {
            integers: ['direction'],
            rules: [
                'All text and annotations must be supplied explicitly; the renderer does not infer grammar, intention, emotion or literary effects.',
                'Text limits include readable line capacity. Overlong input is rejected, never silently truncated.',
                'Text-span offsets are zero-based Unicode characters: start inclusive, end exclusive.'
            ],
            enums: { direction: [1, 2] }
        },
        'english.language.camera_angle': {
            integers: ['viewpoint'],
            rules: [
                'All text and annotations must be supplied explicitly; the renderer does not infer grammar, intention, emotion or literary effects.',
                'Text limits include readable line capacity. Overlong input is rejected, never silently truncated.',
                'Text-span offsets are zero-based Unicode characters: start inclusive, end exclusive.'
            ],
            enums: { viewpoint: [1, 2, 3] }
        },
        'english.language.foreground_depth': {
            integers: ['plane'],
            rules: [
                'All text and annotations must be supplied explicitly; the renderer does not infer grammar, intention, emotion or literary effects.',
                'Text limits include readable line capacity. Overlong input is rejected, never silently truncated.',
                'Text-span offsets are zero-based Unicode characters: start inclusive, end exclusive.'
            ],
            enums: { plane: [1, 2, 3] }
        },
        'english.language.object_detail': {
            integers: ['detail'],
            rules: [
                'All text and annotations must be supplied explicitly; the renderer does not infer grammar, intention, emotion or literary effects.',
                'Text limits include readable line capacity. Overlong input is rejected, never silently truncated.',
                'Text-span offsets are zero-based Unicode characters: start inclusive, end exclusive.'
            ],
            enums: { detail: [1, 2] }
        },
        'english.language.light_direction': {
            integers: ['lightSide'],
            rules: [
                'All text and annotations must be supplied explicitly; the renderer does not infer grammar, intention, emotion or literary effects.',
                'Text limits include readable line capacity. Overlong input is rejected, never silently truncated.',
                'Text-span offsets are zero-based Unicode characters: start inclusive, end exclusive.'
            ],
            enums: { lightSide: [1, 2] }
        },
        'english.language.soundscape': {
            integers: ['source'],
            rules: [
                'All text and annotations must be supplied explicitly; the renderer does not infer grammar, intention, emotion or literary effects.',
                'Text limits include readable line capacity. Overlong input is rejected, never silently truncated.',
                'Text-span offsets are zero-based Unicode characters: start inclusive, end exclusive.'
            ],
            enums: { source: [1, 2, 3] }
        },
        'english.language.character_gesture': {
            integers: ['pose'],
            rules: [
                'All text and annotations must be supplied explicitly; the renderer does not infer grammar, intention, emotion or literary effects.',
                'Text limits include readable line capacity. Overlong input is rejected, never silently truncated.',
                'Text-span offsets are zero-based Unicode characters: start inclusive, end exclusive.'
            ],
            enums: { pose: [1, 2, 3] }
        },
        'english.language.threshold_scene': {
            integers: ['outsideWeather'],
            rules: [
                'All text and annotations must be supplied explicitly; the renderer does not infer grammar, intention, emotion or literary effects.',
                'Text limits include readable line capacity. Overlong input is rejected, never silently truncated.',
                'Text-span offsets are zero-based Unicode characters: start inclusive, end exclusive.'
            ],
            enums: { outsideWeather: [1, 2] }
        },
        'english.language.unreliable_view': {
            integers: ['barrier'],
            rules: [
                'All text and annotations must be supplied explicitly; the renderer does not infer grammar, intention, emotion or literary effects.',
                'Text limits include readable line capacity. Overlong input is rejected, never silently truncated.',
                'Text-span offsets are zero-based Unicode characters: start inclusive, end exclusive.'
            ],
            enums: { barrier: [1, 2] }
        },
        'english.language.poster_speech': {
            integers: ['selectedPanel'],
            rules: [
                'All text and annotations must be supplied explicitly; the renderer does not infer grammar, intention, emotion or literary effects.',
                'Text limits include readable line capacity. Overlong input is rejected, never silently truncated.',
                'Text-span offsets are zero-based Unicode characters: start inclusive, end exclusive.'
            ],
            enums: { selectedPanel: [1, 2] }
        },
        'english.language.discussion_seating': {
            integers: ['participants', 'activeSeat'],
            rules: [
                'All text and annotations must be supplied explicitly; the renderer does not infer grammar, intention, emotion or literary effects.',
                'Text limits include readable line capacity. Overlong input is rejected, never silently truncated.',
                'Text-span offsets are zero-based Unicode characters: start inclusive, end exclusive.',
                'activeSeat must not exceed participants.'
            ]
        },
        'english.literature.sonnet_form': {
            integers: ['section'],
            rules: [
                'All labels, text, interpretations and performance choices are supplied explicitly; no marking or proficiency evidence is created.',
                'Declared text widths and line counts are enforced; unsupported text is rejected without truncation.',
                'Poetic line breaks and whitespace are preserved. Span offsets count Unicode scalars and must respect grapheme boundaries.'
            ],
            enums: { section: [1, 2, 3, 4] }
        },
        'english.literature.enjambment': {
            integers: ['boundary'],
            rules: [
                'All labels, text, interpretations and performance choices are supplied explicitly; no marking or proficiency evidence is created.',
                'Declared text widths and line counts are enforced; unsupported text is rejected without truncation.',
                'Poetic line breaks and whitespace are preserved. Span offsets count Unicode scalars and must respect grapheme boundaries.',
                'Supply 2\u20136 nonempty lines of at most 48 display cells; boundary must precede another line and have no terminal . ! ? ; : .'
            ]
        },
        'english.literature.caesura': {
            integers: ['pauseAfter'],
            rules: [
                'All labels, text, interpretations and performance choices are supplied explicitly; no marking or proficiency evidence is created.',
                'Declared text widths and line counts are enforced; unsupported text is rejected without truncation.',
                'Poetic line breaks and whitespace are preserved. Span offsets count Unicode scalars and must respect grapheme boundaries.',
                'One line only; pauseAfter must lie inside it at a word or punctuation boundary.'
            ]
        },
        'english.literature.metre': {
            integers: [],
            rules: [
                'All labels, text, interpretations and performance choices are supplied explicitly; no marking or proficiency evidence is created.',
                'Declared text widths and line counts are enforced; unsupported text is rejected without truncation.',
                'Poetic line breaks and whitespace are preserved. Span offsets count Unicode scalars and must respect grapheme boundaries.',
                'syllables uses | between 2\u201312 supplied syllables; each is at most seven display cells. Joining the parts exactly must equal source.',
                'pattern contains one u or / per syllable.'
            ]
        },
        'english.literature.rhyme': {
            integers: [],
            rules: [
                'All labels, text, interpretations and performance choices are supplied explicitly; no marking or proficiency evidence is created.',
                'Declared text widths and line counts are enforced; unsupported text is rejected without truncation.',
                'Poetic line breaks and whitespace are preserved. Span offsets count Unicode scalars and must respect grapheme boundaries.',
                'Supply 2\u20136 nonempty lines; one A\u2013H scheme character per line.'
            ]
        },
        'english.literature.volta': {
            integers: ['turnLine'],
            rules: [
                'All labels, text, interpretations and performance choices are supplied explicitly; no marking or proficiency evidence is created.',
                'Declared text widths and line counts are enforced; unsupported text is rejected without truncation.',
                'Poetic line breaks and whitespace are preserved. Span offsets count Unicode scalars and must respect grapheme boundaries.',
                'turnLine must be within the 2\u20138 supplied nonempty lines.'
            ]
        },
        'english.literature.refrain': {
            integers: ['firstLine', 'secondLine'],
            rules: [
                'All labels, text, interpretations and performance choices are supplied explicitly; no marking or proficiency evidence is created.',
                'Declared text widths and line counts are enforced; unsupported text is rejected without truncation.',
                'Poetic line breaks and whitespace are preserved. Span offsets count Unicode scalars and must respect grapheme boundaries.',
                'Supply 3\u20138 nonempty lines. firstLine precedes secondLine; both lines must be exactly equal.'
            ]
        },
        'english.literature.free_verse': {
            integers: [],
            rules: [
                'All labels, text, interpretations and performance choices are supplied explicitly; no marking or proficiency evidence is created.',
                'Declared text widths and line counts are enforced; unsupported text is rejected without truncation.',
                'Poetic line breaks and whitespace are preserved. Span offsets count Unicode scalars and must respect grapheme boundaries.',
                'Supply 2\u20138 physical lines of at most 50 display cells; blank lines count towards the limit.'
            ]
        },
        'english.literature.extract_margin': {
            integers: ['start', 'end'],
            rules: [
                'All labels, text, interpretations and performance choices are supplied explicitly; no marking or proficiency evidence is created.',
                'Declared text widths and line counts are enforced; unsupported text is rejected without truncation.',
                'Poetic line breaks and whitespace are preserved. Span offsets count Unicode scalars and must respect grapheme boundaries.',
                'start/end validate a nonempty, grapheme-aligned span in source.'
            ]
        },
        'english.literature.quotation_weave': {
            integers: ['start', 'end'],
            rules: [
                'All labels, text, interpretations and performance choices are supplied explicitly; no marking or proficiency evidence is created.',
                'Declared text widths and line counts are enforced; unsupported text is rejected without truncation.',
                'Poetic line breaks and whitespace are preserved. Span offsets count Unicode scalars and must respect grapheme boundaries.',
                'The selected span in prose must exactly equal quotation, including case and punctuation.'
            ]
        },
        'english.literature.stanza_space': {
            integers: ['outline'],
            rules: [
                'All labels, text, interpretations and performance choices are supplied explicitly; no marking or proficiency evidence is created.',
                'Declared text widths and line counts are enforced; unsupported text is rejected without truncation.',
                'Poetic line breaks and whitespace are preserved. Span offsets count Unicode scalars and must respect grapheme boundaries.',
                'Supply 2\u20138 exact physical lines of at most 46 display cells. Spaces are textual data, not arbitrary SVG coordinates.',
                'outline: 0 exact text only; 1 trace occupied line extents to show the supplied typographic shape.'
            ]
        },
        'english.literature.stage_plan': {
            integers: ['positionA', 'positionB'],
            rules: [
                'All labels, text, interpretations and performance choices are supplied explicitly; no marking or proficiency evidence is created.',
                'Declared text widths and line counts are enforced; unsupported text is rejected without truncation.',
                'Poetic line breaks and whitespace are preserved. Span offsets count Unicode scalars and must respect grapheme boundaries.',
                'Characters must have distinct labels and distinct stage zones.'
            ]
        },
        'english.literature.thrust_theatre': {
            integers: ['galleryLevels'],
            rules: [
                'All labels, text, interpretations and performance choices are supplied explicitly; no marking or proficiency evidence is created.',
                'Declared text widths and line counts are enforced; unsupported text is rejected without truncation.',
                'Poetic line breaks and whitespace are preserved. Span offsets count Unicode scalars and must respect grapheme boundaries.'
            ]
        },
        'english.literature.proscenium': {
            integers: ['curtain'],
            rules: [
                'All labels, text, interpretations and performance choices are supplied explicitly; no marking or proficiency evidence is created.',
                'Declared text widths and line counts are enforced; unsupported text is rejected without truncation.',
                'Poetic line breaks and whitespace are preserved. Span offsets count Unicode scalars and must respect grapheme boundaries.'
            ],
            enums: { curtain: [1, 2] }
        },
        'english.literature.stage_levels': {
            integers: ['level'],
            rules: [
                'All labels, text, interpretations and performance choices are supplied explicitly; no marking or proficiency evidence is created.',
                'Declared text widths and line counts are enforced; unsupported text is rejected without truncation.',
                'Poetic line breaks and whitespace are preserved. Span offsets count Unicode scalars and must respect grapheme boundaries.'
            ],
            enums: { level: [1, 2] }
        },
        'english.literature.soliloquy': {
            integers: ['position'],
            rules: [
                'All labels, text, interpretations and performance choices are supplied explicitly; no marking or proficiency evidence is created.',
                'Declared text widths and line counts are enforced; unsupported text is rejected without truncation.',
                'Poetic line breaks and whitespace are preserved. Span offsets count Unicode scalars and must respect grapheme boundaries.'
            ],
            enums: { position: [1, 2] }
        },
        'english.literature.aside': {
            integers: ['speaker'],
            rules: [
                'All labels, text, interpretations and performance choices are supplied explicitly; no marking or proficiency evidence is created.',
                'Declared text widths and line counts are enforced; unsupported text is rejected without truncation.',
                'Poetic line breaks and whitespace are preserved. Span offsets count Unicode scalars and must respect grapheme boundaries.',
                'Character labels must be distinct.'
            ],
            enums: { speaker: [1, 2] }
        },
        'english.literature.trapdoor': {
            integers: ['open'],
            rules: [
                'All labels, text, interpretations and performance choices are supplied explicitly; no marking or proficiency evidence is created.',
                'Declared text widths and line counts are enforced; unsupported text is rejected without truncation.',
                'Poetic line breaks and whitespace are preserved. Span offsets count Unicode scalars and must respect grapheme boundaries.'
            ],
            enums: { open: [0, 1] }
        },
        'english.literature.balcony': {
            integers: ['rail'],
            rules: [
                'All labels, text, interpretations and performance choices are supplied explicitly; no marking or proficiency evidence is created.',
                'Declared text widths and line counts are enforced; unsupported text is rejected without truncation.',
                'Poetic line breaks and whitespace are preserved. Span offsets count Unicode scalars and must respect grapheme boundaries.'
            ],
            enums: { rail: [0, 1] }
        },
        'english.literature.discovery_space': {
            integers: ['open'],
            rules: [
                'All labels, text, interpretations and performance choices are supplied explicitly; no marking or proficiency evidence is created.',
                'Declared text widths and line counts are enforced; unsupported text is rejected without truncation.',
                'Poetic line breaks and whitespace are preserved. Span offsets count Unicode scalars and must respect grapheme boundaries.'
            ],
            enums: { open: [0, 1] }
        },
        'english.literature.shadow_screen': {
            integers: ['objectDistance', 'screenDistance'],
            rules: [
                'All labels, text, interpretations and performance choices are supplied explicitly; no marking or proficiency evidence is created.',
                'Declared text widths and line counts are enforced; unsupported text is rejected without truncation.',
                'Poetic line breaks and whitespace are preserved. Span offsets count Unicode scalars and must respect grapheme boundaries.',
                'objectDistance must be less than screenDistance.'
            ]
        },
        'english.literature.split_stage': {
            integers: ['litSide'],
            rules: [
                'All labels, text, interpretations and performance choices are supplied explicitly; no marking or proficiency evidence is created.',
                'Declared text widths and line counts are enforced; unsupported text is rejected without truncation.',
                'Poetic line breaks and whitespace are preserved. Span offsets count Unicode scalars and must respect grapheme boundaries.'
            ],
            enums: { litSide: [1, 2] }
        },
        'english.literature.groundplan_sightline': {
            integers: ['scenery'],
            rules: [
                'All labels, text, interpretations and performance choices are supplied explicitly; no marking or proficiency evidence is created.',
                'Declared text widths and line counts are enforced; unsupported text is rejected without truncation.',
                'Poetic line breaks and whitespace are preserved. Span offsets count Unicode scalars and must respect grapheme boundaries.'
            ],
            enums: { scenery: [1, 2] }
        },
        'english.literature.light_shadow': {
            integers: ['lightSide'],
            rules: [
                'All labels, text, interpretations and performance choices are supplied explicitly; no marking or proficiency evidence is created.',
                'Declared text widths and line counts are enforced; unsupported text is rejected without truncation.',
                'Poetic line breaks and whitespace are preserved. Span offsets count Unicode scalars and must respect grapheme boundaries.'
            ],
            enums: { lightSide: [1, 2] }
        },
        'english.literature.costume': {
            integers: ['garment', 'hat'],
            rules: [
                'All labels, text, interpretations and performance choices are supplied explicitly; no marking or proficiency evidence is created.',
                'Declared text widths and line counts are enforced; unsupported text is rejected without truncation.',
                'Poetic line breaks and whitespace are preserved. Span offsets count Unicode scalars and must respect grapheme boundaries.'
            ],
            enums: { garment: [1, 2], hat: [0, 1] }
        },
        'english.literature.prop': {
            integers: ['object', 'hand'],
            rules: [
                'All labels, text, interpretations and performance choices are supplied explicitly; no marking or proficiency evidence is created.',
                'Declared text widths and line counts are enforced; unsupported text is rejected without truncation.',
                'Poetic line breaks and whitespace are preserved. Span offsets count Unicode scalars and must respect grapheme boundaries.'
            ],
            enums: { object: [1, 2], hand: [1, 2] }
        },
        'english.literature.stage_combat': {
            integers: ['spacing'],
            rules: [
                'All labels, text, interpretations and performance choices are supplied explicitly; no marking or proficiency evidence is created.',
                'Declared text widths and line counts are enforced; unsupported text is rejected without truncation.',
                'Poetic line breaks and whitespace are preserved. Span offsets count Unicode scalars and must respect grapheme boundaries.'
            ],
            enums: { spacing: [1, 2] }
        },
        'english.literature.procession': {
            integers: ['direction'],
            rules: [
                'All labels, text, interpretations and performance choices are supplied explicitly; no marking or proficiency evidence is created.',
                'Declared text widths and line counts are enforced; unsupported text is rejected without truncation.',
                'Poetic line breaks and whitespace are preserved. Span offsets count Unicode scalars and must respect grapheme boundaries.',
                '2\u20135 distinct names, at most 12 display cells each, listed in leading order.'
            ],
            enums: { direction: [1, 2] }
        },
        'english.literature.tableau': {
            integers: ['raised'],
            rules: [
                'All labels, text, interpretations and performance choices are supplied explicitly; no marking or proficiency evidence is created.',
                'Declared text widths and line counts are enforced; unsupported text is rejected without truncation.',
                'Poetic line breaks and whitespace are preserved. Span offsets count Unicode scalars and must respect grapheme boundaries.'
            ],
            enums: { raised: [1, 2] }
        },
        'english.literature.scene_setting': {
            integers: ['door'],
            rules: [
                'All labels, text, interpretations and performance choices are supplied explicitly; no marking or proficiency evidence is created.',
                'Declared text widths and line counts are enforced; unsupported text is rejected without truncation.',
                'Poetic line breaks and whitespace are preserved. Span offsets count Unicode scalars and must respect grapheme boundaries.'
            ],
            enums: { door: [1, 2] }
        },
        'english.literature.room_symbolism': {
            integers: ['object'],
            rules: [
                'All labels, text, interpretations and performance choices are supplied explicitly; no marking or proficiency evidence is created.',
                'Declared text widths and line counts are enforced; unsupported text is rejected without truncation.',
                'Poetic line breaks and whitespace are preserved. Span offsets count Unicode scalars and must respect grapheme boundaries.'
            ],
            enums: { object: [1, 2] }
        },
        'english.literature.threshold': {
            integers: ['open'],
            rules: [
                'All labels, text, interpretations and performance choices are supplied explicitly; no marking or proficiency evidence is created.',
                'Declared text widths and line counts are enforced; unsupported text is rejected without truncation.',
                'Poetic line breaks and whitespace are preserved. Span offsets count Unicode scalars and must respect grapheme boundaries.'
            ],
            enums: { open: [0, 1] }
        },
        'english.literature.workhouse': {
            integers: ['wings'],
            rules: [
                'All labels, text, interpretations and performance choices are supplied explicitly; no marking or proficiency evidence is created.',
                'Declared text widths and line counts are enforced; unsupported text is rejected without truncation.',
                'Poetic line breaks and whitespace are preserved. Span offsets count Unicode scalars and must respect grapheme boundaries.'
            ]
        },
        'english.literature.counting_house': {
            integers: ['partition'],
            rules: [
                'All labels, text, interpretations and performance choices are supplied explicitly; no marking or proficiency evidence is created.',
                'Declared text widths and line counts are enforced; unsupported text is rejected without truncation.',
                'Poetic line breaks and whitespace are preserved. Span offsets count Unicode scalars and must respect grapheme boundaries.'
            ],
            enums: { partition: [0, 1] }
        },
        'english.literature.factory': {
            integers: ['machines'],
            rules: [
                'All labels, text, interpretations and performance choices are supplied explicitly; no marking or proficiency evidence is created.',
                'Declared text widths and line counts are enforced; unsupported text is rejected without truncation.',
                'Poetic line breaks and whitespace are preserved. Span offsets count Unicode scalars and must respect grapheme boundaries.'
            ]
        },
        'english.literature.tenement': {
            integers: ['floors'],
            rules: [
                'All labels, text, interpretations and performance choices are supplied explicitly; no marking or proficiency evidence is created.',
                'Declared text widths and line counts are enforced; unsupported text is rejected without truncation.',
                'Poetic line breaks and whitespace are preserved. Span offsets count Unicode scalars and must respect grapheme boundaries.'
            ]
        },
        'english.literature.battlefield': {
            integers: ['weather'],
            rules: [
                'All labels, text, interpretations and performance choices are supplied explicitly; no marking or proficiency evidence is created.',
                'Declared text widths and line counts are enforced; unsupported text is rejected without truncation.',
                'Poetic line breaks and whitespace are preserved. Span offsets count Unicode scalars and must respect grapheme boundaries.'
            ],
            enums: { weather: [1, 2] }
        },
        'english.literature.memorial': {
            integers: ['form'],
            rules: [
                'All labels, text, interpretations and performance choices are supplied explicitly; no marking or proficiency evidence is created.',
                'Declared text widths and line counts are enforced; unsupported text is rejected without truncation.',
                'Poetic line breaks and whitespace are preserved. Span offsets count Unicode scalars and must respect grapheme boundaries.'
            ],
            enums: { form: [1, 2] }
        }
    }
    var Ve = ue
    function me(t, i) {
        let e = Ve[t]
        if (e) {
            for (let s of e.integers || []) if (!Number.isInteger(i[s])) throw new Error(`${s} must be an integer`)
            for (let [s, a] of Object.entries(e.enums || {})) if (!a.includes(Number(i[s]))) throw new Error(`Unsupported ${s}`)
        }
    }
    var he = {
        1: { symbol: 'H', masses: [1, 2, 3] },
        2: { symbol: 'He', masses: [3, 4] },
        3: { symbol: 'Li', masses: [6, 7] },
        5: { symbol: 'B', masses: [10, 11] },
        6: { symbol: 'C', masses: [12, 13, 14] },
        7: { symbol: 'N', masses: [14, 15] },
        8: { symbol: 'O', masses: [16, 17, 18] },
        10: { symbol: 'Ne', masses: [20, 21, 22] },
        12: { symbol: 'Mg', masses: [24, 25, 26] },
        14: { symbol: 'Si', masses: [28, 29, 30] },
        16: { symbol: 'S', masses: [32, 33, 34, 36] },
        17: { symbol: 'Cl', masses: [35, 37] }
    }
    function ge(t, i) {
        if (!Number.isFinite(t) || !Number.isFinite(i) || i <= 0 || t < 0 || t > i)
            throw new Error('Spot must lie between baseline and solvent front')
        return t / i
    }
    function fe(t, i) {
        if (!t.startsWith('chemistry.')) return
        let e = (a) => Number(i[a]),
            s = (a, r) => {
                if (!a) throw new Error(r)
            }
        for (let a of Object.values(i))
            typeof a == 'number' && s(Number(a.toFixed(3)) === a, 'Chemistry quantities support at most three decimal places')
        if (t === 'chemistry.analysis.chromatography')
            for (let a of ['spotACm', 'spotBCm']) s(ge(e(a), e('frontCm')) <= 0.92, 'Spot lies too close to or above the solvent front')
        if (
            (t === 'chemistry.apparatus.crystallisation' &&
                e('stage') === 1 &&
                s(e('crystals') === 0, 'Crystals belong to the cooling view'),
            t === 'chemistry.apparatus.meniscus' &&
                (s(e('upperMl') > e('lowerMl'), 'Upper scale value must exceed lower value'),
                s(e('readingMl') >= e('lowerMl') && e('readingMl') <= e('upperMl'), 'Reading lies outside the supplied scale')),
            t === 'chemistry.structure.graphite' && s(e('highlightLayer') <= e('layers'), 'Highlighted layer does not exist'),
            t === 'chemistry.resource.water_filter' &&
                s(e('sandCm') / e('gravelCm') >= 1 && e('sandCm') / e('gravelCm') <= 5, 'Sand/gravel depth ratio supports 1\u20135'),
            t === 'chemistry.atom.isotopes')
        ) {
            let a = he[e('atomicNumber')]
            s(!!a && a.masses.includes(e('leftMass')) && a.masses.includes(e('rightMass')), 'Unsupported isotope for this element'),
                s(e('leftMass') !== e('rightMass'), 'Comparison requires distinct isotopes')
        }
    }
    function be(t, i) {
        if (t.startsWith('biology.')) {
            for (let e of Object.values(i))
                if (typeof e == 'number' && Number(e.toFixed(3)) !== e)
                    throw new Error('Biology quantities support at most three decimal places')
            if (t === 'biology.cell.yeast' && i.budStage === 0 && i.focusPart === 4)
                throw new Error('Cannot highlight a bud when no bud is present')
            if (t === 'biology.membrane.active_transport' && Number(i.inside) <= Number(i.outside))
                throw new Error('Active uptake needs a higher inside concentration')
            if (t === 'biology.ecology.transect' && Number(i.boundaryM) > 4 * Number(i.spacingM))
                throw new Error('Habitat boundary lies outside the transect')
            if (t === 'biology.genetics.chromosome') {
                let e = new Set()
                for (let s = 1; s <= 3; s++) {
                    let a = String(i['left' + s]),
                        r = String(i['right' + s])
                    if (!/^[A-Za-z][A-Za-z0-9+-]{0,2}$/.test(a) || !/^[A-Za-z][A-Za-z0-9+-]{0,2}$/.test(r))
                        throw new Error('Invalid allele symbol')
                    let n = a[0].toUpperCase()
                    if (n !== r[0].toUpperCase() || e.has(n))
                        throw new Error('Alleles must match the paired gene and distinguish other loci')
                    e.add(n)
                }
            }
        }
    }
    function ve(t, i) {
        if (t.startsWith('geography.')) {
            for (let [e, s] of Object.entries(i))
                if (typeof s == 'number' && Number(s.toFixed(e === 'eccentricity' ? 4 : 3)) !== s)
                    throw new Error('Geography quantity exceeds its supported precision')
            if (t === 'geography.skills.contour_section') {
                let e = Number(i.baseM) + (Number(i.contours) - 1) * Number(i.intervalM),
                    s = Number(i.summitM) - e
                if (s < Number(i.intervalM) * 0.5 || s > Number(i.intervalM))
                    throw new Error('Supplied summit must lie half to one contour interval above the highest shown contour')
            }
        }
    }
    function ye(t, i) {
        if (t.startsWith('history.')) {
            for (let [e, s] of Object.entries(i))
                if (typeof s == 'number' && Math.abs(s * 1e3 - Math.round(s * 1e3)) > 1e-7)
                    throw new Error(`Unsupported precision for ${e}`)
        }
    }
    function w(t) {
        let i = new Intl.Segmenter('en', { granularity: 'grapheme' }),
            e = 0
        return Array.from(i.segment(t), ({ segment: s }) => {
            let a = e
            return (e += Array.from(s).length), { text: s, start: a, end: e }
        })
    }
    function V(t, i) {
        let e = w(t),
            s = [],
            a = 0
        for (; a < e.length; ) {
            let n = e.findIndex(
                    (c, p) =>
                        p >= a &&
                        c.text ===
                            `
`
                ),
                o = n < 0 ? e.length : n
            if (o === a) {
                s.push({ text: '', start: e[a].start, end: e[a].start }), a++
                continue
            }
            let l = Math.min(o, a + i)
            if (l < o) {
                let c = l
                for (; c > a && e[c - 1].text !== ' '; ) c--
                c > a && (l = c)
            }
            s.push({
                text: e
                    .slice(a, l)
                    .map((c) => c.text)
                    .join(''),
                start: e[a].start,
                end: e[l - 1].end
            }),
                (a = l === o && n >= 0 ? l + 1 : l)
        }
        let r = Array.from(t).length
        return (
            (!e.length ||
                e.at(-1)?.text ===
                    `
`) &&
                s.push({ text: '', start: r, end: r }),
            s
        )
    }
    function we(t, i, e) {
        if (
            typeof t != 'string' ||
            Array.from(t).length < (i.minLength ?? 1) ||
            Array.from(t).length > i.maxLength ||
            /[<>\x00-\x09\x0b-\x1f\x7f\u202a-\u202e\u2066-\u2069]/.test(t) ||
            /[\ud800-\udfff]/u.test(t)
        )
            throw new Error(`Invalid ${e}: use bounded plain text`)
        if ((i.minLength ?? 1) > 0 && !t.trim()) throw new Error(`Missing ${e}`)
        if (V(t, i.columns).length > i.rows) throw new Error(`${e} exceeds this template's readable line limit`)
        return t
    }
    function j(t, i, e, s = 'span') {
        let a = Array.from(t),
            r = new Set([0, ...w(t).map((n) => n.end)])
        if (
            !Number.isInteger(i) ||
            !Number.isInteger(e) ||
            i < 0 ||
            e <= i ||
            e > a.length ||
            !a.slice(i, e).join('').trim() ||
            !r.has(i) ||
            !r.has(e)
        )
            throw new Error(
                `Invalid ${s}: use start-inclusive/end-exclusive Unicode character offsets within supplied text; do not split a grapheme`
            )
    }
    function xe(t, i) {
        if (!t.startsWith('english.language.')) return
        let e = t.slice(17)
        if (
            (['sentence_spans', 'speech_script', 'close_reading', 'edit_marks', 'proof_sheet'].includes(e) &&
                j(String(i.source), Number(i.start), Number(i.end)),
            e === 'comparison_extract')
        )
            for (let s of ['A', 'B']) j(String(i['source' + s]), Number(i['start' + s]), Number(i['end' + s]), 'span ' + s)
        if (e === 'speech_script') {
            let s = Array.from(String(i.source)),
                a = Number(i.pauseAfter)
            if (
                !new Set([0, ...w(String(i.source)).map((r) => r.end)]).has(a) ||
                a > s.length ||
                !Number.isInteger(a) ||
                (a > 0 && a < s.length && /[\p{L}\p{N}\p{M}]/u.test(s[a - 1]) && /[\p{L}\p{N}\p{M}]/u.test(s[a]))
            )
                throw new Error('pauseAfter must be a supplied word or punctuation boundary')
        }
        if (e === 'paragraph_indent') {
            let s = String(i.source).split(`
`)
            if (s.length < 2 || s.length > 3 || s.some((a) => !a.trim()) || s.reduce((a, r) => a + V(r, 42).length, 0) > 6)
                throw new Error('Supply two or three nonempty paragraphs within six displayed lines')
        }
        if (e === 'dialogue_layout' && String(i.speakerA).trim().toLowerCase() === String(i.speakerB).trim().toLowerCase())
            throw new Error('Supply distinct speaker labels')
        if (e === 'word_formation') {
            let s = ['prefix', 'root', 'suffix'].map((a) => String(i[a]))
            if (s.join('') !== i.word || (!s[0] && !s[2]) || [...s, String(i.word)].some((a) => a && !/^[\p{L}\p{M}'’\-]+$/u.test(a)))
                throw new Error('Supplied morphemes must join exactly into one word, with at least one affix')
        }
        if (e === 'edit_marks' && ((i.operation === 1 && !String(i.replacement).trim()) || (i.operation === 2 && i.replacement !== '')))
            throw new Error('Replacement text is required only for a replacement operation')
        if (e === 'discussion_seating' && Number(i.activeSeat) > Number(i.participants))
            throw new Error('Selected speaking seat exceeds participants')
    }
    function Ae(t, i) {
        if (!t.startsWith('english.literature.')) return
        let e = t.slice(19),
            s = String(i.source ?? ''),
            a = s.split(`
`),
            r = {
                enjambment: [2, 6, 48],
                caesura: [1, 1, 52],
                rhyme: [2, 6, 46],
                volta: [2, 8, 48],
                refrain: [3, 8, 49],
                free_verse: [2, 8, 50],
                stanza_space: [2, 8, 46]
            }
        if (r[e]) {
            let [n, o, l] = r[e]
            if (
                a.length < n ||
                a.length > o ||
                a.some((c) => w(c).length > l) ||
                (!['free_verse', 'stanza_space'].includes(e) && a.some((c) => !c.trim()))
            )
                throw new Error('Supply exact poetic lines within the line count and width; no automatic reflow')
        }
        if (e === 'enjambment' && (Number(i.boundary) >= a.length || /[.!?;:]\s*$/.test(a[Number(i.boundary) - 1])))
            throw new Error('Select an internal line boundary without an end-stop; continuation must be supplied')
        if (e === 'caesura') {
            let n = Number(i.pauseAfter),
                o = Array.from(s)
            if (
                n <= 0 ||
                n >= o.length ||
                !new Set(w(s).map((l) => l.end)).has(n) ||
                (/[\p{L}\p{N}\p{M}]/u.test(o[n - 1]) && /[\p{L}\p{N}\p{M}]/u.test(o[n]))
            )
                throw new Error('Supply an internal pause at a word or punctuation boundary')
        }
        if (e === 'metre') {
            let n = String(i.syllables).split('|'),
                o = String(i.pattern)
            if (
                n.length < 2 ||
                n.length > 12 ||
                n.some((l) => !l.trim() || w(l).length > 7) ||
                n.join('') !== s ||
                !/^[u/]+$/.test(o) ||
                o.length !== n.length
            )
                throw new Error('Supply 2\u201312 explicit syllables whose concatenation equals source and one u or / per syllable')
        }
        if (e === 'rhyme' && (!/^[A-H]+$/.test(String(i.scheme)) || String(i.scheme).length !== a.length))
            throw new Error('Supply one A\u2013H rhyme marker per line; matching sounds are not inferred')
        if (e === 'volta' && Number(i.turnLine) > a.length) throw new Error('Turn must be within supplied lines')
        if (
            e === 'refrain' &&
            (Number(i.firstLine) >= Number(i.secondLine) ||
                Number(i.secondLine) > a.length ||
                a[Number(i.firstLine) - 1] !== a[Number(i.secondLine) - 1])
        )
            throw new Error('Refrain occurrences must be ordered, in range and exactly equal')
        if (
            (e === 'extract_margin' && j(s, Number(i.start), Number(i.end)),
            e === 'quotation_weave' &&
                (j(String(i.prose), Number(i.start), Number(i.end)),
                Array.from(String(i.prose)).slice(Number(i.start), Number(i.end)).join('') !== i.quotation))
        )
            throw new Error('Selected prose span must equal the exact supplied quotation')
        if (e === 'stage_plan' && i.positionA === i.positionB) throw new Error('Actors need distinct stage zones')
        if (
            ['stage_plan', 'aside', 'balcony', 'stage_combat', 'tableau', 'split_stage'].includes(e) &&
            String(i.nameA).trim().toLowerCase() === String(i.nameB).trim().toLowerCase()
        )
            throw new Error('Supply distinct character labels')
        if (e === 'shadow_screen' && Number(i.objectDistance) >= Number(i.screenDistance))
            throw new Error('Object must lie between light and screen')
        if (e === 'procession') {
            let n = String(i.order).split(`
`)
            if (
                n.length < 2 ||
                n.length > 5 ||
                n.some((o) => !o.trim() || w(o).length > 12) ||
                new Set(n.map((o) => o.trim().toLowerCase())).size !== n.length
            )
                throw new Error('Supply 2\u20135 distinct ordered character labels of at most 12 characters')
        }
    }
    var H = '0.1.0-preview.1',
        F = Object.freeze(Object.keys(G)),
        Se = G,
        Fe = (t, i) => Object.hasOwn(t, i)
    function ke(t, i) {
        if (!t || typeof t != 'object' || Array.isArray(t)) throw new Error('Expected an object')
        for (let e of Object.keys(t)) if (!i.includes(e)) throw new Error(`Unknown field: ${e}`)
        return t
    }
    function De(t) {
        if (typeof t != 'string' || new TextEncoder().encode(t).length > 12e3) throw new Error('Descriptor exceeds limit')
        let i = ke(JSON.parse(t), ['v', 't', 'p', 'view'])
        if (i.v !== 1 || typeof i.t != 'string' || typeof i.view != 'string' || !['labelled', 'hint', 'blank'].includes(i.view))
            throw new Error('Invalid descriptor envelope')
        let e = `@${H}`
        if (!i.t.endsWith(e)) throw new Error('Unknown template version')
        let s = i.t.slice(0, -e.length)
        if (!Fe(Se, s)) throw new Error('Unknown template')
        let a = Se[s],
            r = ke(i.p, [
                ...Object.keys(a.fields),
                ...Object.keys(a.labels || {}),
                ...Object.keys(a.texts || {}),
                ...(a.units ? ['u'] : [])
            ]),
            n = {}
        for (let [o, [l, c]] of Object.entries(a.fields)) {
            let p = r[o]
            if (typeof p != 'number' || !Number.isFinite(p) || p < l || p > c) throw new Error(`Invalid ${o}`)
            n[o] = p
        }
        for (let [o, l] of Object.entries(a.labels || {})) {
            let c = r[o]
            if (typeof c != 'string' || !c.trim() || c.length > l.maxLength || /[<>\x00-\x1f\x7f]/.test(c)) throw new Error(`Invalid ${o}`)
            n[o] = c.trim()
        }
        for (let [o, l] of Object.entries(a.texts || {})) n[o] = we(r[o], l, o)
        if (a.units) {
            if (typeof r.u != 'string' || !['mm', 'cm', 'm'].includes(r.u)) throw new Error('Invalid units')
            n.u = r.u
        }
        if (s === 'math.area.annulus' && !(Number(n.outerRadius) > Number(n.innerRadius)))
            throw new Error('Outer radius must exceed inner radius')
        if (s === 'math.area.compound_l' && !(Number(n.cutWidth) < Number(n.width) && Number(n.cutHeight) < Number(n.height)))
            throw new Error('Invalid cut-out')
        if (s === 'math.net.cuboid') {
            let o = [Number(n.length), Number(n.width), Number(n.height)]
            if (Math.max(...o) / Math.min(...o) > 8) throw new Error('Net aspect ratio exceeds readable limit')
        }
        if (
            (s === 'physics.optics.refraction' && re(Number(n.incidence), Number(n.n1), Number(n.n2)),
            s === 'math.bearing.three_figure' && !Number.isInteger(n.bearing))
        )
            throw new Error('Bearing must be an integer')
        if (
            s === 'math.number.fraction_strip' &&
            (!Number.isInteger(n.parts) || !Number.isInteger(n.shaded) || Number(n.shaded) > Number(n.parts))
        )
            throw new Error('Fraction cells must be integer counts within the whole')
        if (
            (s === 'math.construction.sss_triangle' && E(Number(n.base), Number(n.left), Number(n.right)),
            s === 'math.number.integer_counters' && (!Number.isInteger(n.positive) || !Number.isInteger(n.negative)))
        )
            throw new Error('Counters must be whole numbers')
        if (s === 'math.number.percentage_grid' && !Number.isInteger(n.shaded)) throw new Error('Shaded cells must be a whole number')
        return (
            me(s, n), ce(s, n), pe(s, n), fe(s, n), be(s, n), ve(s, n), ye(s, n), xe(s, n), Ae(s, n), { v: 1, t: i.t, p: n, view: i.view }
        )
    }
    var ze = '3.2.0',
        We = Object.freeze([...$, ...F, ...ae]),
        _e = (t) => F.includes(t)
    function Ke(t) {
        L(t)
        let i = JSON.stringify(t)
        if (new TextEncoder().encode(i).length > 12e3) throw new Error('descriptor exceeds 12000 UTF-8 bytes')
        if (!t || typeof t != 'object' || Array.isArray(t)) throw new Error('Expected descriptor object')
        let e = t,
            s = Object.hasOwn(e, 'v'),
            a = s && typeof e.t == 'string' ? e.t.split('@')[0] : e.templateId
        if (typeof a == 'string' && se(a)) {
            let l = s ? ['v', 't', 'p', 'view'] : ['schemaVersion', 'templateId', 'templateVersion', 'parameters', 'variant']
            if (
                Object.keys(e).some((c) => !l.includes(c)) ||
                (s ? e.v : e.schemaVersion) !== 1 ||
                (s ? e.t !== a + '@1.0.0' : e.templateVersion !== '1.0.0')
            )
                throw new Error('Invalid published figure descriptor')
            return ne(a, s ? e.p : e.parameters, s ? (e.view === void 0 ? 'hint' : e.view) : e.variant)
        }
        if (typeof a != 'string' || !_e(a)) return J(t)
        let r = s ? ['v', 't', 'p', 'view'] : ['schemaVersion', 'templateId', 'templateVersion', 'parameters', 'variant']
        if (Object.keys(e).some((l) => !r.includes(l))) throw new Error('Unknown descriptor field')
        let n = s ? String(e.t).slice(a.length + 1) : e.templateVersion
        if ((s ? e.v : e.schemaVersion) !== 1 || n !== '1.0.0') throw new Error('Unsupported descriptor version')
        let o = De(
            JSON.stringify({
                v: 1,
                t: `${a}@${H}`,
                p: s ? e.p : e.parameters,
                view: s && e.view === void 0 ? 'hint' : s ? e.view : e.variant
            })
        )
        return { schemaVersion: 1, templateId: a, templateVersion: '1.0.0', parameters: o.p, variant: o.view }
    }
    function Je(t, i) {
        let e = i?.mode?.toLowerCase().replaceAll('_', '-') ?? '',
            s = i?.assessmentState?.toLowerCase().replaceAll('_', '-') ?? ''
        if (['active', 'in-progress', 'started', 'independent'].includes(s))
            throw new Error('visual coaching is unavailable during an active assessment')
        if (e.includes('paper') && !['submitted', 'completed', 'marked', 'review', 'post-submission'].includes(s))
            throw new Error('paper visuals require a verified post-submission state')
        return e.includes('homework') && t.variant === 'labelled' ? { ...t, variant: 'hint' } : t
    }
    return Ce(Xe)
})()
