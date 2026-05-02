const steps = [
  {
    number: '01',
    title: 'Register your building',
    desc: 'Property owner creates an account and adds the building with amenities and units.',
  },
  {
    number: '02',
    title: 'Tenants sign up',
    desc: 'Residents register with their unit and role — instant access to their tenant dashboard.',
  },
  {
    number: '03',
    title: 'Submit & track requests',
    desc: 'Tenants raise maintenance issues. Owners update status in real time — no back and forth.',
  },
  {
    number: '04',
    title: 'Book amenities',
    desc: 'Pick a slot, confirm the booking. System prevents conflicts automatically.',
  },
]

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="w-full bg-brand-bg px-8 py-20 border-b border-brand-border-light">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <p className="font-mono text-xs text-brand-teal uppercase tracking-widest mb-3">
          How it works
        </p>
        <h2 className="font-syne font-bold text-3xl md:text-4xl text-white tracking-tight mb-3">
          Up and running in minutes
        </h2>
        <p className="text-brand-muted text-sm md:text-base max-w-md mb-16">
          No training needed. No complicated setup. Just sign up and go.
        </p>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-0">
          {steps.map((step, i) => (
            <div key={i} className="relative flex flex-col md:border-r border-brand-border-light last:border-r-0 px-6 first:pl-0 last:pr-0">

              {/* Connector line on mobile */}
              {i < steps.length - 1 && (
                <div className="md:hidden absolute left-4 top-10 w-0.5 h-full bg-brand-border-light" />
              )}

              <div className="font-mono text-xs text-brand-teal mb-4">{step.number}</div>

              <div className="w-8 h-8 rounded-lg bg-brand-surface border border-brand-border flex items-center justify-center mb-4">
                <div className="w-2 h-2 rounded-full bg-brand-teal" />
              </div>

              <h3 className="font-syne font-semibold text-sm text-white mb-2">
                {step.title}
              </h3>
              <p className="text-brand-muted text-xs leading-relaxed">
                {step.desc}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}