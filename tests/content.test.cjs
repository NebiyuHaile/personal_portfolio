const { test } = require('node:test')
const assert = require('node:assert/strict')
require('./register-ts.cjs')
const React = require('react')
const { renderToStaticMarkup } = require('react-dom/server')
const { resumeSchema, projectSchema } = require('../src/content/schema.ts')
const { SectionContent } = require('../src/ui/SectionContent.tsx')
const { ListView } = require('../src/ui/ListView.tsx')
const { shouldUseScrollView } = require('../src/lib/viewPreferences.ts')
const resume = require('../public/resume.json')

test('updated resume retains every case study, education, and activities', () => {
 const data = resumeSchema.parse(resume)
 assert.deepEqual(data.projects.map(p=>p.name), ['RouteAlpha: Inference Routing Gateway','CodeGuide: Codebase Q&A and Patch Tool','SAFEHR: Simulation EHR','EMDC Tabulation System'])
 assert.ok(data.education.coursework.includes('Distributed Systems'))
 assert.equal(data.activities.length,4)
 assert.ok(data.projects[0].caseStudy.backend.tech.includes('OpenRouter'))
 assert.ok(data.projects[2].caseStudy.frontend.tech.includes('Next.js'))
})

test('legacy projects remain valid without a case study; malformed layers and unsafe URLs are rejected', () => {
 const legacy = projectSchema.parse({name:'Older work',summary:'A project',tech:['React'],links:{}})
 assert.equal(legacy.caseStudy,undefined)
 assert.equal(projectSchema.safeParse({...legacy,caseStudy:{backend:{summary:'Backend',tech:'FastAPI'}}}).success,false)
 assert.equal(projectSchema.safeParse({...legacy,links:{demo:'javascript:alert(1)'}}).success,false)
 assert.equal(projectSchema.safeParse({...legacy,image:'data:text/html,unsafe'}).success,false)
})

test('frontend, backend, and native platform details stay separate in rendered case studies', () => {
 const project = projectSchema.parse({name:'Architecture fixture',summary:'Test content, not a portfolio claim',tech:[],links:{},caseStudy:{
   frontend:{summary:'Web client responsibilities',tech:['React','Next.js'],details:['Client navigation']},
   backend:{summary:'Inference responsibilities',tech:['FastAPI','PostgreSQL','LiteLLM'],details:['Provider routing']},
   platform:{summary:'Native intervention responsibilities',tech:['Native APIs'],details:['OS permissions']},
   decisions:[{title:'Boundary',decision:'Separate client and service',tradeoff:'API coordination'}],outcomes:['Verified outcome'],
 }})
 const html = renderToStaticMarkup(React.createElement(SectionContent,{id:'projects',data:{...resumeSchema.parse(resume),projects:[project]}}))
 assert.match(html, /aria-label="Frontend architecture"[^]*?React[^]*?Next.js/)
 assert.match(html, /aria-label="Backend &amp; data"[^]*?FastAPI[^]*?PostgreSQL[^]*?LiteLLM/)
 assert.match(html, /aria-label="Native &amp; platform"[^]*?OS permissions/)
 assert.ok(html.includes('API coordination'))
 assert.ok(html.includes('Verified outcome'))
})

test('the linear view includes the same project deep dives and all five section anchors', () => {
 const data = resumeSchema.parse(resume)
 const html = renderToStaticMarkup(React.createElement(ListView,{data}))
 for (const id of ['introduction','experience','projects','skills','contact']) assert.ok(html.includes(`id="${id}-heading"`))
 for (const project of data.projects) {
  assert.ok(html.includes(project.name.replace(/&/g,'&amp;')))
  for(const outcome of project.caseStudy?.outcomes ?? []) assert.ok(html.includes(outcome))
 }
 assert.ok(html.includes('500+ users'))
 assert.ok(html.includes('Expected December 2026'))
 assert.ok(html.includes('Professional development &amp; activities'))
})

test('scroll fallback handles reduced motion, weak mobile signals, missing APIs, and unavailable WebGL', () => {
 const baseline={reducedMotion:false,mobile:false,webgl:true,cores:8,memory:8}
 assert.equal(shouldUseScrollView(baseline),false)
 assert.equal(shouldUseScrollView({...baseline,reducedMotion:true}),true)
 assert.equal(shouldUseScrollView({...baseline,webgl:false}),true)
 assert.equal(shouldUseScrollView({...baseline,mobile:true,memory:2}),true)
 assert.equal(shouldUseScrollView({...baseline,mobile:true,cores:2}),true)
 assert.equal(shouldUseScrollView({...baseline,mobile:true,saveData:true}),true)
 assert.equal(shouldUseScrollView({...baseline,mobile:true,memory:undefined}),true)
 assert.equal(shouldUseScrollView({...baseline,mobile:true}),false)
 assert.equal(shouldUseScrollView({...baseline,memory:undefined,cores:undefined}),false)
})
