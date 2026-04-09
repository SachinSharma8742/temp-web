import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Send, User, Mail, Phone, MessageSquare } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const ContactForm = () => {
    const sectionRef = useRef(null);
    const formRef = useRef(null);
    const [formState, setFormState] = useState({
        name: '',
        email: '',
        phone: '',
        message: '',
    });
    const [submitStatus, setSubmitStatus] = useState(null); // null, 'submitting', 'success', 'error'
    const [focused, setFocused] = useState(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.fromTo(
                '.contact-fade-item',
                { y: 40, opacity: 0 },
                {
                    y: 0,
                    opacity: 1,
                    duration: 0.9,
                    stagger: 0.12,
                    ease: 'power2.out',
                    scrollTrigger: {
                        trigger: sectionRef.current,
                        start: 'top 78%',
                    },
                }
            );
        }, sectionRef);
        return () => ctx.revert();
    }, []);

    const handleChange = (e) => {
        setFormState((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitStatus('submitting');

        try {
            const formData = new FormData(e.target);
            formData.append("access_key", "7fe72276-c3e7-4195-98f8-1260dbf562db");

            const response = await fetch("https://api.web3forms.com/submit", {
                method: "POST",
                body: formData
            });

            const data = await response.json();

            if (data.success) {
                setSubmitStatus('success');
                setTimeout(() => {
                    setSubmitStatus(null);
                    setFormState({ name: '', email: '', phone: '', message: '' });
                }, 4000);
            } else {
                setSubmitStatus('error');
                setTimeout(() => setSubmitStatus(null), 4000);
            }
        } catch {
            setSubmitStatus('error');
            setTimeout(() => setSubmitStatus(null), 4000);
        }
    };

    const inputStyle = (field) => ({
        backgroundColor: 'color-mix(in srgb, var(--bg-surface) 60%, var(--bg-base))',
        borderColor:
            focused === field
                ? 'var(--color-gold, #4F7FF0)'
                : 'var(--border-subtle)',
        color: 'var(--text-body)',
        outline: 'none',
        transition: 'border-color 0.35s ease, box-shadow 0.35s ease',
        boxShadow:
            focused === field
                ? '0 0 0 3px rgba(79, 127, 240, 0.15)'
                : 'none',
    });

    return (
        <section
            ref={sectionRef}
            id="contact"
            className="relative -mt-px overflow-hidden px-4 py-16 md:px-8 md:py-24 lg:px-12"
            style={{
                backgroundColor: 'var(--bg-base, #0e0e0e)',
                color: 'var(--text-body, #e8e0d0)',
            }}
        >
            {/* Noise overlay */}
            <div
                className="pointer-events-none absolute inset-0 opacity-[0.03] mix-blend-overlay"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
                    WebkitMaskImage:
                        'linear-gradient(180deg, transparent 0%, black 14%, black 100%)',
                    maskImage:
                        'linear-gradient(180deg, transparent 0%, black 14%, black 100%)',
                }}
            />

            {/* Top divider glow */}
            <div
                className="pointer-events-none absolute inset-x-0 top-0 h-px"
                style={{
                    background:
                        'linear-gradient(90deg, transparent 10%, rgba(79,127,240,0.18) 50%, transparent 90%)',
                }}
            />

            <div className="mx-auto max-w-[1120px]">
                {/* Header */}
                <div className="mb-10 md:mb-16 contact-fade-item">
                    <span
                        className="mb-4 block text-[10px] uppercase tracking-[0.3em] md:text-xs font-bold"
                        style={{
                            backgroundImage:
                                'linear-gradient(90deg, var(--color-gold, #4F7FF0) 0%, #8FB3FF 45%, var(--color-gold, #4F7FF0) 100%)',
                            backgroundSize: '200% auto',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text',
                            animation: 'slideIt 5s linear infinite',
                        }}
                    >
                        Get In Touch
                    </span>
                    <h2
                        className="font-heading text-[1.75rem] leading-[1.05] md:text-4xl lg:text-[3rem]"
                        style={{ letterSpacing: '-0.025em' }}
                    >
                        Let's Plan Your Journey
                    </h2>
                    <p className="mt-3 text-sm leading-relaxed opacity-50 md:mt-4 md:text-[15px] max-w-md">
                        Share your vision and we'll craft an unforgettable experience
                        tailored just for you.
                    </p>
                </div>

                {/* Form */}
                {submitStatus === 'success' || submitStatus === 'error' ? (
                    <div
                        className="animate-in fade-in zoom-in duration-500 flex flex-col items-center justify-center py-16 md:py-24 rounded-2xl border"
                        style={{
                            borderColor: submitStatus === 'success' ? 'rgba(79,127,240,0.25)' : 'rgba(239,68,68,0.25)',
                            backgroundColor:
                                'color-mix(in srgb, var(--bg-surface) 80%, var(--bg-base))',
                        }}
                    >
                        <div
                            className="w-16 h-16 rounded-full flex items-center justify-center mb-6"
                            style={{
                                background: submitStatus === 'success' ?
                                    'linear-gradient(135deg, rgba(79,127,240,0.2), rgba(143,179,255,0.12))' :
                                    'linear-gradient(135deg, rgba(239,68,68,0.2), rgba(248,113,113,0.12))',
                                border: submitStatus === 'success' ? '1px solid rgba(79,127,240,0.3)' : '1px solid rgba(239,68,68,0.3)',
                            }}
                        >
                            <Send
                                size={28}
                                style={{ color: submitStatus === 'success' ? 'var(--color-gold, #4F7FF0)' : '#EF4444' }}
                            />
                        </div>
                        <h3
                            className="font-heading text-xl md:text-2xl mb-2"
                            style={{ color: 'var(--text-heading)' }}
                        >
                            {submitStatus === 'success' ? 'Message Sent' : 'Message failed'}
                        </h3>
                        <p className="text-sm opacity-50">
                            {submitStatus === 'success' ? "We'll be in touch within 24 hours." : "Please try again later."}
                        </p>
                    </div>
                ) : (
                    <form
                        ref={formRef}
                        onSubmit={handleSubmit}
                        className="contact-fade-item grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6"
                    >
                        {/* Name */}
                        <div className="relative contact-fade-item">
                            <label
                                htmlFor="contact-name"
                                className="block text-[10px] uppercase tracking-[0.25em] mb-2 font-semibold"
                                style={{
                                    color: 'color-mix(in srgb, var(--text-body) 55%, transparent)',
                                }}
                            >
                                Your Name
                            </label>
                            <div className="relative">
                                <User
                                    size={16}
                                    className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
                                    style={{
                                        color:
                                            focused === 'name'
                                                ? 'var(--color-gold, #4F7FF0)'
                                                : 'color-mix(in srgb, var(--text-body) 30%, transparent)',
                                        transition: 'color 0.3s ease',
                                    }}
                                />
                                <input
                                    id="contact-name"
                                    type="text"
                                    name="name"
                                    required
                                    value={formState.name}
                                    onChange={handleChange}
                                    onFocus={() => setFocused('name')}
                                    onBlur={() => setFocused(null)}
                                    placeholder="Full name"
                                    className="w-full rounded-xl border pl-11 pr-4 py-3.5 text-sm placeholder:opacity-30"
                                    style={inputStyle('name')}
                                />
                            </div>
                        </div>

                        {/* Email */}
                        <div className="relative contact-fade-item">
                            <label
                                htmlFor="contact-email"
                                className="block text-[10px] uppercase tracking-[0.25em] mb-2 font-semibold"
                                style={{
                                    color: 'color-mix(in srgb, var(--text-body) 55%, transparent)',
                                }}
                            >
                                Email Address
                            </label>
                            <div className="relative">
                                <Mail
                                    size={16}
                                    className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
                                    style={{
                                        color:
                                            focused === 'email'
                                                ? 'var(--color-gold, #4F7FF0)'
                                                : 'color-mix(in srgb, var(--text-body) 30%, transparent)',
                                        transition: 'color 0.3s ease',
                                    }}
                                />
                                <input
                                    id="contact-email"
                                    type="email"
                                    name="email"
                                    required
                                    value={formState.email}
                                    onChange={handleChange}
                                    onFocus={() => setFocused('email')}
                                    onBlur={() => setFocused(null)}
                                    placeholder="email@example.com"
                                    className="w-full rounded-xl border pl-11 pr-4 py-3.5 text-sm placeholder:opacity-30"
                                    style={inputStyle('email')}
                                />
                            </div>
                        </div>

                        {/* Phone */}
                        <div className="relative contact-fade-item">
                            <label
                                htmlFor="contact-phone"
                                className="block text-[10px] uppercase tracking-[0.25em] mb-2 font-semibold"
                                style={{
                                    color: 'color-mix(in srgb, var(--text-body) 55%, transparent)',
                                }}
                            >
                                Phone Number
                            </label>
                            <div className="relative">
                                <Phone
                                    size={16}
                                    className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
                                    style={{
                                        color:
                                            focused === 'phone'
                                                ? 'var(--color-gold, #4F7FF0)'
                                                : 'color-mix(in srgb, var(--text-body) 30%, transparent)',
                                        transition: 'color 0.3s ease',
                                    }}
                                />
                                <input
                                    id="contact-phone"
                                    type="tel"
                                    name="phone"
                                    value={formState.phone}
                                    onChange={handleChange}
                                    onFocus={() => setFocused('phone')}
                                    onBlur={() => setFocused(null)}
                                    placeholder="+91 00000 00000"
                                    className="w-full rounded-xl border pl-11 pr-4 py-3.5 text-sm placeholder:opacity-30"
                                    style={inputStyle('phone')}
                                />
                            </div>
                        </div>

                        {/* Empty spacer on desktop for grid alignment */}
                        <div className="hidden md:block" />

                        {/* Message */}
                        <div className="relative md:col-span-2 contact-fade-item">
                            <label
                                htmlFor="contact-message"
                                className="block text-[10px] uppercase tracking-[0.25em] mb-2 font-semibold"
                                style={{
                                    color: 'color-mix(in srgb, var(--text-body) 55%, transparent)',
                                }}
                            >
                                Your Vision
                            </label>
                            <div className="relative">
                                <MessageSquare
                                    size={16}
                                    className="absolute left-4 top-4 pointer-events-none"
                                    style={{
                                        color:
                                            focused === 'message'
                                                ? 'var(--color-gold, #4F7FF0)'
                                                : 'color-mix(in srgb, var(--text-body) 30%, transparent)',
                                        transition: 'color 0.3s ease',
                                    }}
                                />
                                <textarea
                                    id="contact-message"
                                    name="message"
                                    required
                                    rows={5}
                                    value={formState.message}
                                    onChange={handleChange}
                                    onFocus={() => setFocused('message')}
                                    onBlur={() => setFocused(null)}
                                    placeholder="Tell us about your dream journey—destinations, dates, preferences…"
                                    className="w-full rounded-xl border pl-11 pr-4 py-3.5 text-sm placeholder:opacity-30 resize-none"
                                    style={inputStyle('message')}
                                />
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="md:col-span-2 flex justify-start contact-fade-item">
                            <button
                                type="submit"
                                disabled={submitStatus === 'submitting'}
                                className="group relative inline-flex items-center gap-3 rounded-xl px-8 py-3.5 text-sm font-bold uppercase tracking-[0.2em] overflow-hidden transition-all duration-500 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
                                style={{
                                    background:
                                        'linear-gradient(135deg, var(--color-gold, #4F7FF0) 0%, var(--color-accent, #2F5FD1) 100%)',
                                    color: '#fff',
                                    border: 'none',
                                    boxShadow:
                                        '0 6px 24px rgba(79, 127, 240, 0.25), 0 2px 8px rgba(79, 127, 240, 0.12)',
                                }}
                            >
                                {/* Hover shine sweep */}
                                <span
                                    className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                                    style={{
                                        background:
                                            'linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.15) 50%, transparent 70%)',
                                        backgroundSize: '250% 100%',
                                        animation: 'slideIt 3s linear infinite',
                                    }}
                                />
                                <span className="relative z-10">{submitStatus === 'submitting' ? 'Sending...' : 'Send Message'}</span>
                                <Send
                                    size={16}
                                    className={`relative z-10 transition-transform duration-300 ${submitStatus === 'submitting' ? 'animate-pulse' : 'group-hover:translate-x-1 group-hover:-translate-y-0.5'}`}
                                />
                            </button>
                        </div>
                    </form>
                )}

                {/* Bottom subtle info */}
                <div
                    className="mt-8 md:mt-12 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 contact-fade-item"
                    style={{
                        opacity: 0.3,
                        fontSize: '10px',
                        letterSpacing: '0.25em',
                        textTransform: 'uppercase',
                    }}
                >
                    <span>We respond within 24 hours</span>
                    <span style={{ color: 'var(--color-gold, #4F7FF0)' }}>
                        Your journey starts here
                    </span>
                </div>
            </div>
        </section>
    );
};

export default ContactForm;
