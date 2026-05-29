/* ============ Screen 08 — Checkout & Payment ============ */

const COUNTRIES = [
  ['BD', 'Bangladesh · ৳'],
  ['IN', 'India · ₹'],
  ['PK', 'Pakistan · ₨'],
  ['LK', 'Sri Lanka · ₨'],
  ['NP', 'Nepal · ₨'],
  ['PT', 'Portugal · €'], ['ES', 'Spain · €'], ['FR', 'France · €'], ['DE', 'Germany · €'],
  ['IT', 'Italy · €'], ['NL', 'Netherlands · €'], ['BE', 'Belgium · €'], ['IE', 'Ireland · €'],
  ['GB', 'United Kingdom · £'], ['US', 'United States · $'], ['CA', 'Canada · C$'],
  ['BR', 'Brazil · R$'], ['MX', 'Mexico · MX$'], ['AU', 'Australia · A$'], ['JP', 'Japan · ¥'],
  ['SG', 'Singapore · S$'], ['AE', 'UAE · د.إ'], ['SA', 'Saudi Arabia · ﷼'], ['ZA', 'South Africa · R'],
];

const BD_METHODS = [
  { id: 'bkash', label: 'bKash', accent: '#E2136E', l: 'Mobile · OTP · BDT' },
  { id: 'nagad', label: 'Nagad', accent: '#EE1C25', l: 'Govt mobile wallet' },
  { id: 'rocket', label: 'Rocket', accent: '#8A2D6C', l: 'DBBL · Mobile Banking' },
  { id: 'upay', label: 'Upay', accent: '#E84E0F', l: 'UCB digital wallet' },
];

const REGIONAL_METHODS = {
  BD: ['card', 'bkash', 'nagad', 'rocket'],
  IN: ['card', 'upi', 'paypal'],
  PK: ['card', 'paypal'],
  default_eu: ['card', 'paypal', 'sepa', 'apple'],
  default: ['card', 'paypal', 'apple'],
};

function methodsFor(country) {
  if (REGIONAL_METHODS[country]) return REGIONAL_METHODS[country];
  const eu = ['PT','ES','FR','DE','IT','NL','BE','IE','GB'];
  return eu.includes(country) ? REGIONAL_METHODS.default_eu : REGIONAL_METHODS.default;
}

function detectBrand(num) {
  const n = num.replace(/\s+/g, '');
  if (/^4/.test(n)) return 'Visa';
  if (/^(5[1-5]|2[2-7])/.test(n)) return 'Mastercard';
  if (/^3[47]/.test(n)) return 'Amex';
  if (/^6(?:011|5)/.test(n)) return 'Discover';
  if (/^3(?:0[0-5]|[68])/.test(n)) return 'Diners';
  return '';
}

function formatCardNum(v) {
  const digits = v.replace(/\D/g, '').slice(0, 19);
  return digits.replace(/(.{4})/g, '$1 ').trim();
}

function CardChip() {
  return (
    <div className="cp-chip" aria-hidden>
      <svg viewBox="0 0 38 28" width="100%" height="100%" style={{ position: 'absolute', inset: 0 }}>
        <path d="M2 8h12M2 14h8M2 20h12M24 8h12M28 14h8M24 20h12M14 4v8M14 16v8M24 4v8M24 16v8" stroke="rgba(0,0,0,0.35)" strokeWidth="0.7" fill="none"/>
      </svg>
    </div>
  );
}

function Checkout() {
  const [state] = useAppState();
  const ck = state.checkout || { planId: 'starter', annual: true };
  const plan = TIERS.find(t => t.id === ck.planId) || TIERS[2];

  const [step, setStep] = useState(1);          // 1 details · 2 payment · (3 → success route)
  const [annual, setAnnual] = useState(!!ck.annual);
  const [payMethod, setPayMethod] = useState('bkash');
  const [promo, setPromo] = useState('');
  const [promoApplied, setPromoApplied] = useState(null);
  const [errors, setErrors] = useState({});
  const [processing, setProcessing] = useState(false);
  const [gateway, setGateway] = useState(null);  // {method, ...} when redirected to wallet

  const [form, setForm] = useState({
    email: state.user?.email || 'demo@qdenty.io',
    fullName: state.user?.name ? state.user.name.replace(/\b\w/g, c => c.toUpperCase()) : 'Mahmud Hasan',
    company: '',
    country: 'BD',
    addr1: 'House 42, Road 12, Dhanmondi',
    city: 'Dhaka',
    postal: '1209',
    vat: '',
    cardNumber: '',
    cardName: 'Mahmud Hasan',
    expiry: '',
    cvc: '',
    mobileNum: '',
    upiId: '',
    iban: '',
  });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  // pricing math
  const baseAmount = annual ? plan.annual * 12 : plan.monthly;
  const cycleLabel = annual ? '/ year · billed annually' : '/ month';
  const promoDisc = promoApplied ? Math.round(baseAmount * 0.2) : 0;
  const subtotal = baseAmount;
  const vatRate = vatFor(form.country) / 100;
  const taxable = Math.max(0, subtotal - promoDisc);
  const tax = Math.round(taxable * vatRate);
  const total = taxable + tax;

  const brand = detectBrand(form.cardNumber);

  // keep selected payment method valid for the chosen country
  useEffect(() => {
    const allowed = methodsFor(form.country);
    if (!allowed.includes(payMethod)) setPayMethod(allowed[0]);
  }, [form.country]);

  const applyPromo = () => {
    if (!promo.trim()) return;
    if (promo.trim().toUpperCase() === 'QDENTY20') {
      setPromoApplied('QDENTY20');
      showToast('Promo · 20% off applied');
    } else {
      showToast('Promo code not recognised');
    }
  };

  const validateDetails = () => {
    const e = {};
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) e.email = 'Enter a valid email';
    if (!form.fullName.trim()) e.fullName = 'Required';
    if (!form.addr1.trim()) e.addr1 = 'Required';
    if (!form.city.trim()) e.city = 'Required';
    if (!form.postal.trim()) e.postal = 'Required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validatePayment = () => {
    const e = {};
    if (payMethod === 'card') {
      const n = form.cardNumber.replace(/\s/g, '');
      if (n.length < 13 || n.length > 19) e.cardNumber = 'Card number looks short';
      if (!/^(0[1-9]|1[0-2])\s?\/\s?\d{2}$/.test(form.expiry)) e.expiry = 'MM / YY';
      if (!/^\d{3,4}$/.test(form.cvc)) e.cvc = '3–4 digits';
      if (!form.cardName.trim()) e.cardName = 'Required';
    }
    if (payMethod === 'upi') {
      if (!/^[\w.-]+@[a-z]+$/i.test(form.upiId)) e.upiId = 'e.g. name@bank';
    }
    if (payMethod === 'sepa') {
      const iban = form.iban.replace(/\s+/g, '');
      if (iban.length < 15) e.iban = 'IBAN looks short';
    }
    // wallet methods (bkash/nagad/rocket/upay) handle their auth inside the gateway modal
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const finalizeOrder = (meta) => {
    const order = {
      no: 'QD-' + Date.now().toString(36).toUpperCase().slice(-7),
      plan: plan.id,
      planName: typeof plan.name === 'string' ? plan.name : 'Free Account',
      annual,
      amount: total,
      tax,
      subtotal,
      discount: promoDisc,
      promoCode: promoApplied,
      method: payMethod,
      last4: meta.last4,
      brand: meta.brand,
      gatewayRef: meta.gatewayRef,
      email: form.email,
      name: form.fullName,
      country: form.country,
      date: new Date().toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: '2-digit' }),
    };
    setAppState(s => ({
      ...s,
      authed: true,
      user: s.user || { email: form.email, name: form.fullName.split(' ')[0] },
      planId: plan.id,
      lastOrder: order,
      orders: [order, ...(s.orders || [])],
      checkout: null,
      plan: order.planName,
    }));
    setProcessing(false);
    setGateway(null);
    navigate('checkout/success');
  };

  const submit = () => {
    if (!validatePayment()) { showToast('Check the highlighted fields'); return; }

    // Wallet methods → open gateway modal, the gateway resolves to finalizeOrder
    if (['bkash', 'nagad', 'rocket', 'upay'].includes(payMethod)) {
      setGateway({ method: payMethod, amount: total, country: form.country });
      return;
    }

    setProcessing(true);
    setTimeout(() => {
      const methodMap = {
        card: { brand: brand || 'Card', last4: form.cardNumber.replace(/\s/g, '').slice(-4) || '0000' },
        upi: { brand: 'UPI', last4: form.upiId.slice(0, 18) },
        paypal: { brand: 'PayPal', last4: form.email },
        sepa: { brand: 'SEPA', last4: form.iban.replace(/\s/g, '').slice(-4) || '••••' },
        apple: { brand: 'Apple Pay', last4: '——' },
      };
      finalizeOrder(methodMap[payMethod] || methodMap.card);
    }, 1400);
  };

  return (
    <>
      <PageLabel
        screen={6}
        left={`SCREEN 08 — CHECKOUT · STEP ${step} OF 2`}
        right={`PLAN · ${(typeof plan.name === 'string' ? plan.name : 'PRO').toUpperCase()} · ${annual ? 'ANNUAL' : 'MONTHLY'}`}
      />
      <section className="screen" style={{ paddingTop: 48 }}>
        <div className="screen-tag"><b>§ 08</b>Secure Checkout</div>

        <div className="checkout-wrap">
          <div className="uc-head" style={{ marginBottom: 24 }}>
            <h2>Almost <span className="it">there.</span></h2>
            <div className="uc-intro">
              <span className="lbl">Step {step} of 2 · billing & payment</span>
              Two minutes to dynamic codes, analytics, custom branding & all the templates. Cancel anytime — we'll refund any unused months at pro rata.
            </div>
          </div>

          <div className="checkout-steps">
            <div className={'step ' + (step > 1 ? 'done' : 'on')} onClick={() => setStep(1)}>
              <span className="n">1</span><span>Your Details</span>
            </div>
            <div className="divider"></div>
            <div className={'step ' + (step === 2 ? 'on' : '')} onClick={() => step > 1 && setStep(2)}>
              <span className="n">2</span><span>Payment</span>
            </div>
            <div className="divider"></div>
            <div className="step">
              <span className="n">3</span><span>Confirmation</span>
            </div>
            <span className="lock-pill">Secure · 256-bit TLS</span>
          </div>

          <div className="checkout-grid">
            <div className="checkout-main">
              {step === 1 && (
                <CheckoutDetails form={form} set={set} errors={errors} />
              )}
              {step === 2 && (
                <CheckoutPayment
                  form={form}
                  set={set}
                  errors={errors}
                  payMethod={payMethod}
                  setPayMethod={setPayMethod}
                  brand={brand}
                />
              )}

              <div className="checkout-footer">
                {step > 1 ? (
                  <a className="back" onClick={() => setStep(s => s - 1)}>Back</a>
                ) : (
                  <a className="back" onClick={() => navigate('pricing')}>Back to pricing</a>
                )}
                {step === 1 && (
                  <a className="btn-pri full" onClick={() => {
                    if (validateDetails()) setStep(2);
                    else showToast('Check the highlighted fields');
                  }}>Continue to payment</a>
                )}
                {step === 2 && (
                  <a className={'btn-pri full' + (processing ? ' processing' : '')} onClick={submit}
                     style={processing ? { background: 'var(--accent)', pointerEvents: 'none' } : {}}>
                    {processing ? 'Processing…' : `Pay ${formatMoney(total, form.country)}`}
                  </a>
                )}
              </div>
            </div>

            <aside className="order-summary">
              <div className="os-ttl">
                <span>Order Summary</span>
                {plan.featured && <span className="os-tier-tag">Recommended</span>}
              </div>
              <div className="os-plan">{plan.name}</div>
              <div className="os-desc">{plan.desc}</div>

              <div className="os-cycle">
                <span className={!annual ? 'on' : ''} onClick={() => setAnnual(false)}>Monthly</span>
                <span className={annual ? 'on' : ''} onClick={() => setAnnual(true)}>
                  Annual<span className="badge">−32%</span>
                </span>
              </div>

              <ul className="os-features">
                {plan.features.filter(f => !f.no).slice(0, 5).map((f, i) => (
                  <li key={i}>{f.t}</li>
                ))}
              </ul>

              <div className="os-totals">
                <div className="os-row">
                  <span className="l">Subtotal</span>
                  <span className="v">{formatMoney(subtotal, form.country)}</span>
                </div>
                {promoDisc > 0 && (
                  <div className="os-row discount">
                    <span className="l">Promo · {promoApplied}</span>
                    <span className="v">−{formatMoney(promoDisc, form.country)}</span>
                  </div>
                )}
                {vatRate > 0 && (
                  <div className="os-row">
                    <span className="l">{form.country === 'BD' ? 'VAT (Mushak)' : form.country === 'IN' ? 'GST' : 'VAT'} · {(vatRate * 100).toFixed(0)}%</span>
                    <span className="v">{formatMoney(tax, form.country)}</span>
                  </div>
                )}
                <div className="os-row total">
                  <span className="l">Total<span className="it"> due today</span></span>
                  <span className="v">
                    <span className="curr">{currencySymbol(form.country)}</span>{total}
                  </span>
                </div>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--ink-mute)', textAlign: 'right', marginTop: 4 }}>
                  {cycleLabel}
                </div>
              </div>

              <div className="os-promo">
                {promoApplied ? (
                  <div className="applied">✓ {promoApplied} · −20%</div>
                ) : (
                  <>
                    <input
                      value={promo}
                      onChange={e => setPromo(e.target.value.toUpperCase())}
                      placeholder="Promo code"
                      maxLength={16}
                    />
                    <button onClick={applyPromo}>Apply</button>
                  </>
                )}
              </div>

              <div className="trust-row">
                <div className="t"><b>Money-back</b><span>within 30 days</span></div>
                <div className="t"><b>Cancel</b><span>anytime, pro rata</span></div>
                <div className="t"><b>PCI-DSS</b><span>via Stripe</span></div>
                <div className="t"><b>GDPR</b><span>EU-hosted data</span></div>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {gateway && (
        <WalletGateway
          method={gateway.method}
          amount={gateway.amount}
          country={gateway.country}
          onClose={() => setGateway(null)}
          onSuccess={(meta) => finalizeOrder(meta)}
        />
      )}
    </>
  );
}

/* ---------- Step 1: Details ---------- */

function CheckoutDetails({ form, set, errors }) {
  return (
    <>
      <div className="crumb" style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--ink-mute)', marginBottom: 12 }}>
        Step 01 · The basics
      </div>
      <h2>Tell us <span className="it">who</span><br />the invoice is for.</h2>
      <p className="sub">We email the receipt, and use the address for VAT compliance. Nothing else.</p>

      <div className="form-stack">
        <div className="field-row">
          <div className="field">
            <label>Full Name</label>
            <input value={form.fullName} onChange={e => set('fullName', e.target.value)} placeholder="Adelaide Marlow" />
            {errors.fullName && <div className="field-hint" style={{ color: 'var(--accent)' }}>{errors.fullName}</div>}
          </div>
          <div className="field">
            <label>Email · receipt sent here</label>
            <input type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="you@studio.co" />
            {errors.email && <div className="field-hint" style={{ color: 'var(--accent)' }}>{errors.email}</div>}
          </div>
        </div>

        <div className="field-row">
          <div className="field">
            <label>Company · optional</label>
            <input value={form.company} onChange={e => set('company', e.target.value)} placeholder="Casa Editorial" />
          </div>
          <div className="field">
            <label>VAT / Tax ID · optional</label>
            <input value={form.vat} onChange={e => set('vat', e.target.value)} placeholder="PT500000000" />
            <div className="field-hint">EU businesses · removes VAT on invoice</div>
          </div>
        </div>

        <div className="field">
          <label>Billing address</label>
          <input value={form.addr1} onChange={e => set('addr1', e.target.value)} placeholder="Street + number" />
          {errors.addr1 && <div className="field-hint" style={{ color: 'var(--accent)' }}>{errors.addr1}</div>}
        </div>

        <div className="field-row" style={{ gridTemplateColumns: '1.4fr 1fr 1fr' }}>
          <div className="field">
            <label>Country</label>
            <select value={form.country} onChange={e => set('country', e.target.value)}>
              {COUNTRIES.map(([c, n]) => <option key={c} value={c}>{n}</option>)}
            </select>
          </div>
          <div className="field">
            <label>City</label>
            <input value={form.city} onChange={e => set('city', e.target.value)} placeholder="Lisbon" />
            {errors.city && <div className="field-hint" style={{ color: 'var(--accent)' }}>{errors.city}</div>}
          </div>
          <div className="field">
            <label>Postal</label>
            <input value={form.postal} onChange={e => set('postal', e.target.value)} placeholder="1200-194" />
            {errors.postal && <div className="field-hint" style={{ color: 'var(--accent)' }}>{errors.postal}</div>}
          </div>
        </div>
      </div>
    </>
  );
}

/* ---------- Step 2: Payment ---------- */

const METHOD_DEFS = {
  card:   { name: <>Card<span className="it"> ·</span></>,  l: 'Visa · Mastercard · Amex' },
  paypal: { name: <>Pay<span className="it">Pal</span></>,  l: 'Redirect to PayPal' },
  sepa:   { name: <>SEPA<span className="it"> ·</span></>,  l: 'EU bank debit' },
  apple:  { name: <>Apple<span className="it"> Pay</span></>, l: 'Touch ID · Face ID', locked: true },
  bkash:  { name: <>b<span className="it">Kash</span></>,   l: 'Mobile · OTP · BDT', accent: '#E2136E' },
  nagad:  { name: <>Nagad</>,                                l: 'Govt mobile wallet · BDT', accent: '#EE1C25' },
  rocket: { name: <>Rocket</>,                               l: 'DBBL Mobile Banking',     accent: '#8A2D6C' },
  upay:   { name: <>Upay</>,                                 l: 'UCB digital wallet',      accent: '#E84E0F' },
  upi:    { name: <>UPI<span className="it"> ·</span></>,    l: 'India · any UPI app',     accent: '#097939' },
};

function CheckoutPayment({ form, set, errors, payMethod, setPayMethod, brand }) {
  const allowed = methodsFor(form.country);
  const methods = allowed.map(id => ({ id, ...METHOD_DEFS[id] }));

  return (
    <>
      <div className="crumb" style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--ink-mute)', marginBottom: 12 }}>
        Step 02 · How you'd like to pay
        <span style={{ marginLeft: 12, color: 'var(--accent)' }}>· {COUNTRIES.find(c => c[0] === form.country)?.[1].split(' · ')[0]} options</span>
      </div>
      <h2>Pick a <span className="it">way,</span><br />and you're in.</h2>
      <p className="sub">Payment processed by Stripe (cards) or by the regional partner directly. We never see your full credentials — only confirmation.</p>

      <div className="pay-methods" style={{ gridTemplateColumns: `repeat(${Math.min(methods.length, 4)}, 1fr)` }}>
        {methods.map(m => (
          <div key={m.id}
               className={'pm pm-' + m.id + (payMethod === m.id ? ' on' : '') + (m.locked ? ' locked' : '')}
               style={payMethod === m.id && m.accent ? { background: m.accent, color: '#fff' } : {}}
               onClick={() => !m.locked && setPayMethod(m.id)}>
            <div className="pm-mark">{m.name}</div>
            <div className="pm-l">{m.l}</div>
          </div>
        ))}
      </div>

      {payMethod === 'card' && (
        <CardForm form={form} set={set} errors={errors} brand={brand} />
      )}

      {['bkash', 'nagad', 'rocket', 'upay'].includes(payMethod) && (
        <WalletRedirect method={payMethod} amount={null} country={form.country} />
      )}

      {payMethod === 'upi' && (
        <UPIForm form={form} set={set} errors={errors} />
      )}

      {payMethod === 'paypal' && (
        <div className="alt-pay">
          <h3>Redirect to <span className="it">PayPal</span></h3>
          <p>You'll finish the payment on paypal.com and come right back. We'll show your confirmation here.</p>
          <a className="alt-btn paypal">
            <span style={{ fontFamily: 'var(--serif-italic)', fontStyle: 'italic', fontSize: 22 }}>P</span>
            Continue with PayPal
          </a>
        </div>
      )}

      {payMethod === 'sepa' && (
        <div className="card-form">
          <div className="field">
            <label>Account holder</label>
            <input value={form.fullName} onChange={e => set('fullName', e.target.value)} />
          </div>
          <div className="field">
            <label>IBAN</label>
            <input inputMode="numeric" value={form.iban} onChange={e => set('iban', e.target.value.toUpperCase())} placeholder="PT50 0000 0000 0000 0000 0000 0" maxLength={34} />
            {errors.iban && <div className="field-hint" style={{ color: 'var(--accent)' }}>{errors.iban}</div>}
            <div className="field-hint">European Union · €  · 3 business days to clear</div>
          </div>
          <div style={{ padding: 16, background: 'var(--paper-2)', border: '1px dashed var(--rule)', fontSize: 13, color: 'var(--ink-soft)' }}>
            By providing your IBAN you authorise Mabous Innovations &amp; Engineering Ltd. to debit your account in accordance with the SEPA Direct Debit mandate.
          </div>
        </div>
      )}

      {payMethod === 'apple' && (
        <div className="alt-pay">
          <h3>Apple <span className="it">Pay</span></h3>
          <p>Coming soon — we're finalising entitlements with Apple.</p>
        </div>
      )}
    </>
  );
}

function CardForm({ form, set, errors, brand }) {
  return (
    <>
      <div className="card-preview">
        <div className="cp-top">
          <div className="cp-logo">qdenty<sup>™ pay</sup></div>
          <CardChip />
        </div>
        <div className="cp-num">
          {(form.cardNumber || '0000 0000 0000 0000').split(' ').map((g, i) => (
            <span key={i}>{(g + '0000').slice(0, 4)}</span>
          ))}
        </div>
        <div className="cp-foot">
          <div className="cp-block">
            <div className="l">Cardholder</div>
            <div className="v">{(form.cardName || 'Your Name').slice(0, 22)}</div>
          </div>
          <div className="cp-block">
            <div className="l">Expires</div>
            <div className="v">{form.expiry || 'MM / YY'}</div>
          </div>
          <div className="cp-brand">{brand || 'card'}</div>
        </div>
      </div>

      <div className="card-form">
        <div className="field">
          <label>Card Number</label>
          <div className="input-shell">
            <input
              inputMode="numeric"
              value={form.cardNumber}
              onChange={e => set('cardNumber', formatCardNum(e.target.value))}
              placeholder="1234 5678 9012 3456"
              maxLength={23}
              autoComplete="cc-number"
            />
            {brand && <span className="brand-mark">{brand}</span>}
          </div>
          {errors.cardNumber && <div className="field-hint" style={{ color: 'var(--accent)' }}>{errors.cardNumber}</div>}
        </div>

        <div className="field">
          <label>Name on card</label>
          <input value={form.cardName} onChange={e => set('cardName', e.target.value.toUpperCase())} placeholder="ADELAIDE MARLOW" autoComplete="cc-name" />
          {errors.cardName && <div className="field-hint" style={{ color: 'var(--accent)' }}>{errors.cardName}</div>}
        </div>

        <div className="field-row">
          <div className="field">
            <label>Expiry · MM/YY</label>
            <input
              inputMode="numeric"
              value={form.expiry}
              onChange={e => {
                let v = e.target.value.replace(/\D/g, '').slice(0, 4);
                if (v.length >= 3) v = v.slice(0, 2) + ' / ' + v.slice(2);
                set('expiry', v);
              }}
              placeholder="04 / 28"
              maxLength={7}
              autoComplete="cc-exp"
            />
            {errors.expiry && <div className="field-hint" style={{ color: 'var(--accent)' }}>{errors.expiry}</div>}
          </div>
          <div className="field">
            <label>Security · CVC</label>
            <input
              inputMode="numeric"
              value={form.cvc}
              onChange={e => set('cvc', e.target.value.replace(/\D/g, '').slice(0, 4))}
              placeholder="•••"
              maxLength={4}
              autoComplete="cc-csc"
            />
            {errors.cvc && <div className="field-hint" style={{ color: 'var(--accent)' }}>{errors.cvc}</div>}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', background: 'var(--paper-2)', border: '1px dashed var(--rule)', fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--ink-mute)' }}>
          <span style={{ display: 'inline-grid', placeItems: 'center', width: 18, height: 18, border: '1.5px solid var(--accent-2)', borderRadius: '50%', color: 'var(--accent-2)', fontFamily: 'var(--serif)' }}>✓</span>
          Encrypted in transit · stored only as token by Stripe · never on qdenty servers
        </div>
      </div>
    </>
  );
}

/* ---------- Wallet redirect — the on-page intent screen ---------- */

const WALLET_CFG = {
  bkash:  {
    brand: 'bKash',  accent: '#E2136E', textOn: '#fff',
    tagline: 'Mobile · BDT',
    gateway: 'sandbox.bkash.com / tokenized · v1.2.0-beta',
    sandboxMobile: '01770618576',
    sandboxOtp: '123456',
    sandboxPin: '12121',
    merchant: 'qdenty · Mabous Innovations',
    badge: 'bKash Checkout',
  },
  nagad:  {
    brand: 'Nagad',  accent: '#EE1C25', textOn: '#fff',
    tagline: 'Govt mobile wallet · BDT',
    gateway: 'sandbox.mynagad.com / tokenized',
    sandboxMobile: '01770010060',
    sandboxOtp: '111111',
    sandboxPin: '4321',
    merchant: 'qdenty · Mabous Innovations',
    badge: 'Nagad PGW',
  },
  rocket: {
    brand: 'Rocket', accent: '#8A2D6C', textOn: '#fff',
    tagline: 'DBBL · Mobile Banking',
    gateway: 'sandbox.dutchbangla.com / rocket',
    sandboxMobile: '017xxxxxxx0',
    sandboxOtp: '654321',
    sandboxPin: '1234',
    merchant: 'qdenty · Mabous Innovations',
    badge: 'Rocket Gateway',
  },
  upay: {
    brand: 'Upay',   accent: '#E84E0F', textOn: '#fff',
    tagline: 'UCB digital wallet',
    gateway: 'sandbox.upaybd.com / merchant',
    sandboxMobile: '01609000000',
    sandboxOtp: '000000',
    sandboxPin: '1234',
    merchant: 'qdenty · Mabous Innovations',
    badge: 'Upay PGW',
  },
};

function WalletRedirect({ method }) {
  const cfg = WALLET_CFG[method];
  return (
    <div className="wallet-redirect" style={{ '--wallet-c': cfg.accent }}>
      <div className="wr-head">
        <div className="wr-logo" style={{ background: cfg.accent }}>{cfg.brand[0]}</div>
        <div>
          <div className="wr-h">You'll finish on <span className="brand">{cfg.brand}</span></div>
          <div className="wr-p">Continue redirects you to the official {cfg.brand} payment gateway. Your PIN and OTP are entered there — never on qdenty.</div>
        </div>
      </div>

      <ul className="wr-list">
        <li><span className="n">01</span><span><b>Click <em>Pay</em></b> below — we hand off to {cfg.brand}.</span></li>
        <li><span className="n">02</span><span>Authorise the charge with your registered mobile, OTP &amp; PIN inside the gateway.</span></li>
        <li><span className="n">03</span><span>You're returned to qdenty automatically. Your plan unlocks the moment the gateway confirms.</span></li>
      </ul>

      <div className="wr-sandbox">
        <div className="wr-sandbox-l">SANDBOX · use these test credentials in the gateway</div>
        <div className="wr-sandbox-grid">
          <div><span className="k">Customer</span><span className="v">{cfg.sandboxMobile}</span></div>
          <div><span className="k">OTP</span><span className="v">{cfg.sandboxOtp}</span></div>
          <div><span className="k">PIN</span><span className="v">{cfg.sandboxPin}</span></div>
        </div>
      </div>

      <div className="wr-trust">
        <div className="wr-trust-i">
          <div className="g">⛨</div>
          <div>
            <b>End-to-end encrypted</b>
            <span>PIN never touches qdenty servers</span>
          </div>
        </div>
        <div className="wr-trust-i">
          <div className="g">◈</div>
          <div>
            <b>{cfg.gateway}</b>
            <span>{cfg.brand} merchant API · tokenized</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- Wallet gateway — simulates the official wallet payment page ---------- */

function WalletGateway({ method, amount, country, onClose, onSuccess }) {
  const cfg = WALLET_CFG[method];
  const [phase, setPhase] = useState('connect');   // connect → otp → pin → processing
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [pin, setPin] = useState('');
  const [err, setErr] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  const refNo = useMemo(() => 'TR' + Date.now().toString().slice(-10), []);
  const total = currencySymbol(country) + amount.toLocaleString();

  const formatMobile = (v) => {
    const d = v.replace(/\D/g, '').slice(0, 11);
    return d;
  };

  const stepConnect = () => {
    setErr('');
    if (mobile.length !== 11 || !/^01[3-9]/.test(mobile)) {
      setErr('Enter a valid 11-digit Bangladesh mobile (013-019).');
      return;
    }
    setOtpSent(true);
    setCountdown(30);
    setPhase('otp');
  };

  const stepOtp = () => {
    setErr('');
    if (otp.length !== 6 || !/^\d{6}$/.test(otp)) {
      setErr('Enter the 6-digit code we just sent to your mobile.');
      return;
    }
    setPhase('pin');
  };

  const stepPin = () => {
    setErr('');
    if (!/^\d{4,5}$/.test(pin)) {
      setErr(`Enter your ${cfg.brand} PIN (4-5 digits).`);
      return;
    }
    setPhase('processing');
    setTimeout(() => {
      onSuccess({
        brand: cfg.brand,
        last4: mobile.slice(-4),
        gatewayRef: refNo,
      });
    }, 1700);
  };

  const cancel = () => {
    if (phase === 'processing') return;
    if (confirm(`Cancel ${cfg.brand} payment and return to qdenty?`)) onClose();
  };

  return (
    <div className="gateway-backdrop" onClick={cancel}>
      <div className="gateway" onClick={e => e.stopPropagation()} style={{ '--wallet-c': cfg.accent }}>
        {/* Browser-like top with gateway URL */}
        <div className="gw-chrome">
          <div className="gw-dots"><span></span><span></span><span></span></div>
          <div className="gw-url"><span className="lock">●</span> {cfg.gateway.split(' / ')[0]}</div>
          <div className="gw-x" onClick={cancel}>✕</div>
        </div>

        <div className="gw-body">
          {/* Brand header */}
          <div className="gw-brand" style={{ background: cfg.accent, color: cfg.textOn }}>
            <div className="gw-brand-l">
              <div className="gw-brand-name">{cfg.brand}</div>
              <div className="gw-brand-tag">{cfg.badge}</div>
            </div>
            <div className="gw-brand-amt">
              <div className="gw-brand-amt-l">Amount</div>
              <div className="gw-brand-amt-v">{total}</div>
            </div>
          </div>

          {/* Merchant info */}
          <div className="gw-merchant">
            <div className="gw-merchant-row">
              <span className="k">Merchant</span>
              <span className="v">{cfg.merchant}</span>
            </div>
            <div className="gw-merchant-row">
              <span className="k">Invoice</span>
              <span className="v">{refNo}</span>
            </div>
            <div className="gw-merchant-row">
              <span className="k">Currency</span>
              <span className="v">BDT (৳)</span>
            </div>
          </div>

          {/* Step indicator */}
          <div className="gw-steps">
            <span className={'s ' + (phase === 'connect' ? 'on' : phase !== 'connect' ? 'done' : '')}>1 · Account</span>
            <span className={'s ' + (phase === 'otp' ? 'on' : (phase === 'pin' || phase === 'processing') ? 'done' : '')}>2 · Verify</span>
            <span className={'s ' + (phase === 'pin' ? 'on' : phase === 'processing' ? 'done' : '')}>3 · PIN</span>
          </div>

          {/* Sandbox helper */}
          <div className="gw-sandbox">
            <span className="lbl">Sandbox · auto-fill</span>
            <button onClick={() => {
              setMobile(cfg.sandboxMobile);
              setOtp(cfg.sandboxOtp);
              setPin(cfg.sandboxPin);
            }}>Use test credentials</button>
          </div>

          {phase === 'connect' && (
            <div className="gw-step">
              <label>Your {cfg.brand} mobile number</label>
              <input
                value={mobile}
                onChange={e => setMobile(formatMobile(e.target.value))}
                placeholder="01XXXXXXXXX"
                inputMode="numeric"
                autoFocus
              />
              <p className="hint">An OTP will be sent to this number. Standard SMS rates may apply.</p>
              {err && <div className="gw-err">{err}</div>}
              <button className="gw-cta" style={{ background: cfg.accent }} onClick={stepConnect}>
                Send OTP → Continue
              </button>
            </div>
          )}

          {phase === 'otp' && (
            <div className="gw-step">
              <label>Enter the 6-digit OTP</label>
              <div className="otp-row">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className={'otp-cell' + (otp[i] ? ' filled' : '') + (i === otp.length ? ' active' : '')}>
                    {otp[i] || ''}
                  </div>
                ))}
              </div>
              <input
                className="otp-input"
                value={otp}
                onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                inputMode="numeric"
                maxLength={6}
                autoFocus
              />
              <p className="hint">
                Sent to {mobile.slice(0, 5)}*****{mobile.slice(-2)}
                {countdown > 0
                  ? <> · resend in <b>{countdown}s</b></>
                  : <> · <a onClick={() => { setCountdown(30); setOtp(''); }}>Resend OTP</a></>}
              </p>
              {err && <div className="gw-err">{err}</div>}
              <button className="gw-cta" style={{ background: cfg.accent }} onClick={stepOtp}>Verify OTP</button>
              <button className="gw-back" onClick={() => { setPhase('connect'); setOtp(''); setErr(''); }}>← Change number</button>
            </div>
          )}

          {phase === 'pin' && (
            <div className="gw-step">
              <label>Enter your {cfg.brand} PIN</label>
              <input
                type="password"
                value={pin}
                onChange={e => setPin(e.target.value.replace(/\D/g, '').slice(0, 5))}
                placeholder="••••"
                inputMode="numeric"
                maxLength={5}
                className="pin-input"
                autoFocus
              />
              <p className="hint">Only you and {cfg.brand} can see your PIN. qdenty receives only a confirmation token.</p>
              {err && <div className="gw-err">{err}</div>}
              <button className="gw-cta" style={{ background: cfg.accent }} onClick={stepPin}>Confirm Payment</button>
              <button className="gw-back" onClick={() => { setPhase('otp'); setPin(''); setErr(''); }}>← Back</button>
            </div>
          )}

          {phase === 'processing' && (
            <div className="gw-step processing">
              <div className="gw-spin" style={{ borderTopColor: cfg.accent }}></div>
              <div className="gw-proc-h">Charging {cfg.brand} account…</div>
              <div className="gw-proc-p">Don't close this window. Confirmation usually arrives in 2-3 seconds.</div>
            </div>
          )}

          <div className="gw-foot">
            <span>🔒 Encrypted by {cfg.brand} · TLS 1.3 · PCI-DSS</span>
            <span>Ref. {refNo}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function UPIForm({ form, set, errors }) {
  return (
    <div className="card-form">
      <div className="field">
        <label>UPI ID / VPA</label>
        <input value={form.upiId} onChange={e => set('upiId', e.target.value.toLowerCase())} placeholder="name@bank" />
        {errors.upiId && <div className="field-hint" style={{ color: 'var(--accent)' }}>{errors.upiId}</div>}
        <div className="field-hint">Any UPI app · GPay · PhonePe · Paytm · BHIM</div>
      </div>
      <div style={{ padding: 16, background: 'var(--paper-2)', border: '1px dashed var(--rule)', fontSize: 13, color: 'var(--ink-soft)' }}>
        After confirming, you'll get a collect request in your UPI app. Approve within 5 minutes.
      </div>
    </div>
  );
}

/* ---------- helpers ---------- */

function currencySymbol(country) {
  const map = {
    US: '$', CA: 'C$', GB: '£', JP: '¥', IN: '₹', BR: 'R$', MX: 'MX$',
    SG: 'S$', ZA: 'R', AU: 'A$', AE: 'د.إ', SA: '﷼',
    BD: '৳', PK: '₨', LK: '₨', NP: '₨',
  };
  return map[country] || '€';
}
function formatMoney(n, country) {
  return currencySymbol(country) + n.toLocaleString();
}

function vatFor(country) {
  const eu = { PT: 23, ES: 21, FR: 20, DE: 19, IT: 22, NL: 21, BE: 21, IE: 23, GB: 20 };
  if (eu[country] !== undefined) return eu[country];
  if (country === 'BD') return 15;     // Bangladesh VAT (Mushak)
  if (country === 'IN') return 18;     // India GST (services)
  if (country === 'PK') return 16;
  return 0;
}

/* ---------- Success / receipt ---------- */

function CheckoutSuccess() {
  const [state] = useAppState();
  const order = state.lastOrder;

  useEffect(() => {
    if (!order) {
      // came here directly without ordering — bounce back
      navigate('pricing');
    }
  }, []);

  if (!order) return null;

  const verifyUrl = `https://qdenty.io/receipt/${order.no}`;
  const planLabel = order.planName.replace(/<[^>]+>/g, '');

  return (
    <>
      <PageLabel screen={6} left="SCREEN 09 — ORDER CONFIRMED · RECEIPT" right={`ORDER ${order.no} · PAID`} />
      <section className="screen" style={{ paddingTop: 48 }}>
        <div className="screen-tag"><b>§ 09</b>Receipt</div>

        <div className="success-wrap">
          <div className="success-mark" aria-hidden>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12.5l4.5 4.5L19 7" />
            </svg>
          </div>

          <h1>
            Welcome to <span className="it">{planLabel}</span>,<br />
            {order.name.split(' ')[0]}.
          </h1>
          <p className="success-lede">
            Payment of {currencySymbol(order.country)}{order.amount.toLocaleString()} has cleared. Your dynamic codes, vector exports and analytics are live in your dashboard. A receipt is on its way to <b style={{ color: 'var(--ink)' }}>{order.email}</b>.
          </p>

          <div className="receipt">
            <div className="receipt-main">
              <div className="r-head">
                <div className="r-ttl">
                  Receipt · Mabous Innovations &amp; Engineering Ltd.
                  <b>{planLabel} <span style={{ fontFamily: 'var(--serif-italic)', fontStyle: 'italic', fontWeight: 400, color: 'var(--ink-mute)' }}>· {order.annual ? 'Annual' : 'Monthly'}</span></b>
                </div>
                <div className="r-no">
                  Order No
                  <b>{order.no}</b>
                </div>
              </div>

              <div className="r-grid">
                <div className="r-cell"><div className="l">Billed to</div><div className="v">{order.name}</div></div>
                <div className="r-cell"><div className="l">Date</div><div className="v it">{order.date}</div></div>
                <div className="r-cell"><div className="l">Email</div><div className="v" style={{ fontFamily: 'var(--mono)', fontSize: 13, letterSpacing: 0 }}>{order.email}</div></div>
                <div className="r-cell"><div className="l">Method</div><div className="v">{order.brand} · •••• {order.last4}</div></div>
              </div>

              <div className="r-line"><span className="l">Plan · {planLabel}</span><span>{currencySymbol(order.country)}{order.subtotal.toLocaleString()}</span></div>
              {order.discount > 0 && (
                <div className="r-line" style={{ color: 'var(--accent)' }}>
                  <span className="l">Promo · {order.promoCode}</span>
                  <span>−{currencySymbol(order.country)}{order.discount.toLocaleString()}</span>
                </div>
              )}
              {order.tax > 0 && (
                <div className="r-line"><span className="l">VAT · 23%</span><span>{currencySymbol(order.country)}{order.tax.toLocaleString()}</span></div>
              )}
              <div className="r-line tot"><span className="l">Total paid</span><span>{currencySymbol(order.country)}{order.amount.toLocaleString()}</span></div>
            </div>

            <div className="receipt-side">
              <div className="r-qr">
                <QRCode value={verifyUrl} size={156} fg="#0f0e0c" bg="#f3efe7" style="rounded" />
              </div>
              <div className="r-note">"Scan to verify · keep for tax records."</div>
              <div className="r-stamp">Paid ✓ {order.date}</div>
            </div>
          </div>

          <div className="next-cards">
            <div className="nc" onClick={() => navigate('dashboard')}>
              <div className="nc-n">— Next · 01</div>
              <h4>Open your <span className="it">dashboard</span></h4>
              <p>Your existing codes are now dynamic. Edit destinations, swap colours, watch the scans roll in.</p>
              <span className="go">Go to dashboard</span>
            </div>
            <div className="nc" onClick={() => navigate('builder')}>
              <div className="nc-n">— Next · 02</div>
              <h4>Generate your <span className="it">first</span> Pro code</h4>
              <p>All 22 templates unlocked. PDF, SVG, EPS. Logo embedding. Custom validity windows.</p>
              <span className="go">Open generator</span>
            </div>
            <div className="nc" onClick={() => {
              showToast('Receipt PDF downloading · demo');
            }}>
              <div className="nc-n">— Next · 03</div>
              <h4>Download <span className="it">PDF</span> receipt</h4>
              <p>For your accountant or expense report. Includes VAT breakdown and your VAT ID if you provided one.</p>
              <span className="go">Download PDF</span>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

Object.assign(window, { Checkout, CheckoutSuccess, COUNTRIES });
