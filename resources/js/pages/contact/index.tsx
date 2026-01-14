import { Link, usePage } from '@inertiajs/react';
import MainHeader from '@/components/main-header';
import Footer from '@/components/footer';
import { useTranslation } from '@/hooks/use-translation';
import { ChevronRight, Phone, MapPin, Briefcase, Send, Loader2, CheckCircle2, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useState } from 'react';
import { toast } from 'sonner';
import SEO from '@/components/seo';
import { generateCanonicalUrl, type BreadcrumbItem } from '@/lib/seo';

interface PageProps {
    seo: {
        siteName: string;
        siteUrl: string;
    };
    locale: string;
}

export default function Contact() {
    const { t, route } = useTranslation();
    const { seo } = usePage<PageProps>().props;

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });
    const [errors, setErrors] = useState<{
        name?: string;
        email?: string;
        subject?: string;
        message?: string;
    }>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    // Validation
    const validateForm = () => {
        const newErrors: typeof errors = {};

        if (!formData.name.trim()) {
            newErrors.name = t('validation.name_required', 'Name is required');
        } else if (formData.name.trim().length < 2) {
            newErrors.name = t('validation.name_min', 'Name must be at least 2 characters');
        }

        if (!formData.email.trim()) {
            newErrors.email = t('validation.email_required', 'Email is required');
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = t('validation.email_invalid', 'Please enter a valid email address');
        }

        if (!formData.subject.trim()) {
            newErrors.subject = t('validation.subject_required', 'Subject is required');
        } else if (formData.subject.trim().length < 5) {
            newErrors.subject = t('validation.subject_min', 'Subject must be at least 5 characters');
        }

        if (!formData.message.trim()) {
            newErrors.message = t('validation.message_required', 'Message is required');
        } else if (formData.message.trim().length < 10) {
            newErrors.message = t('validation.message_min', 'Message must be at least 10 characters');
        } else if (formData.message.trim().length > 1000) {
            newErrors.message = t('validation.message_max', 'Message must not exceed 1000 characters');
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (response.ok) {
                setIsSuccess(true);
                setFormData({ name: '', email: '', subject: '', message: '' });
                toast.success(t('contact.success_message', 'Thank you for your message! We will get back to you soon.'));

                // Reset success message after 5 seconds
                setTimeout(() => setIsSuccess(false), 5000);
            } else {
                toast.error(data.message || t('contact.error_message', 'Failed to send message. Please try again.'));
            }
        } catch {
            toast.error(t('contact.error_message', 'Failed to send message. Please try again.'));
        } finally {
            setIsSubmitting(false);
        }
    };

    // Handle input change
    const handleChange = (field: keyof typeof formData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        // Clear error when user types
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: undefined }));
        }
    };

    const contactInfo = [
        {
            icon: Phone,
            title: t('contact.contacts', 'Contacts'),
            items: [
                {
                    label: t('contact.phone', 'Phone'),
                    value: '+37060117017',
                    href: 'tel:+37060117017',
                    type: 'link' as const
                }
            ]
        },
        {
            icon: MapPin,
            title: t('contact.visit_us', 'Visit Us'),
            items: [
                {
                    label: t('contact.address', 'Address'),
                    value: 'Vaidoto g. 1, Kaunas',
                    type: 'text' as const
                },
                {
                    label: t('contact.hours', 'Hours'),
                    value: t('contact.monday_friday', 'Monday - Friday: 9 AM to 5 PM'),
                    type: 'text' as const
                }
            ]
        },
        {
            icon: Briefcase,
            title: t('contact.work_with_us', 'Work with Us?'),
            items: [
                {
                    label: t('contact.email', 'Email'),
                    value: 'info@naturalmente.lt',
                    href: 'mailto:info@naturalmente.lt',
                    type: 'link' as const
                }
            ]
        },
        {
            icon: Building2,
            title: t('contact.company_details', 'Company Details'),
            items: [
                {
                    label: t('contact.company_name', 'Company'),
                    value: 'Natural Beauty Ds, UAB',
                    type: 'text' as const
                },
                {
                    label: t('contact.company_code', 'Company Code'),
                    value: '302496441',
                    type: 'text' as const
                },
                {
                    label: t('contact.vat_code', 'VAT Code'),
                    value: 'LT100005410619',
                    type: 'text' as const
                }
            ]
        }
    ];

    // SEO data
    const siteUrl = seo?.siteUrl || '';
    const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';
    const canonicalUrl = generateCanonicalUrl(siteUrl, currentPath);

    // Breadcrumbs for structured data
    const breadcrumbs: BreadcrumbItem[] = [
        { name: t('nav.home', 'Home'), url: siteUrl },
        { name: t('contact.title', 'Contact'), url: canonicalUrl },
    ];

    // Alternate URLs for hreflang
    const alternateUrls = [
        { locale: 'en', url: `${siteUrl}/contact` },
        { locale: 'lt', url: `${siteUrl}/lt/kontaktai` },
    ];

    // LocalBusiness schema for contact page
    const localBusinessSchema = {
        '@context': 'https://schema.org',
        '@type': 'LocalBusiness',
        name: seo?.siteName || 'Shop Natural',
        image: `${siteUrl}/images/logo.svg`,
        telephone: '+37060117017',
        email: 'info@naturalmente.lt',
        address: {
            '@type': 'PostalAddress',
            streetAddress: 'Vaidoto g. 1',
            addressLocality: 'Kaunas',
            postalCode: '45387',
            addressCountry: 'LT',
        },
        openingHoursSpecification: {
            '@type': 'OpeningHoursSpecification',
            dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
            opens: '09:00',
            closes: '17:00',
        },
        url: siteUrl,
    };

    return (
        <>
            <SEO
                title={t('contact.meta_title', 'Contact Us')}
                description={t('contact.meta_description', 'Get in touch with Shop Natural. Visit us in Kaunas, call us, or send us a message. We are here to help with your natural cosmetics needs.')}
                keywords={t('contact.meta_keywords', 'contact Shop Natural, natural cosmetics Kaunas, eco beauty shop Lithuania')}
                canonical={canonicalUrl}
                alternateUrls={alternateUrls}
                breadcrumbs={breadcrumbs}
                additionalSchemas={[localBusinessSchema]}
            />

            <div className="min-h-screen bg-background">
                <MainHeader />

                {/* Breadcrumb */}
                <div className="border-b border-border">
                    <div className="container mx-auto px-4 py-4 md:px-6 lg:px-8">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Link href={route('home')} className="hover:text-foreground transition-colors">
                                {t('nav.home', 'Home')}
                            </Link>
                            <ChevronRight className="size-4" />
                            <span className="text-foreground">{t('contact.title', 'Contact')}</span>
                        </div>
                    </div>
                </div>

                <div className="container mx-auto px-4 py-8 md:px-6 md:py-12 lg:px-8">
                    {/* Page Heading */}
                    <div className="mb-8 md:mb-12">
                        <h1 className="text-2xl font-bold uppercase tracking-wide text-foreground md:text-3xl lg:text-4xl">
                            {t('contact.heading', "We'd love to hear from you.")}
                        </h1>
                    </div>

                    {/* Map and Form Grid - Form on right, Map on left for large screens */}
                    <div className="mb-8 md:mb-12 grid gap-8 lg:grid-cols-2">
                        {/* Google Map - Shown first on mobile, left on desktop */}
                        <div className="order-2 lg:order-1">
                            <div className="overflow-hidden rounded-2xl border-2 border-border h-full min-h-[450px] lg:min-h-[650px]">
                                <iframe
                                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2295.9879658!2d23.9014!3d54.8985!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x46e722b8e8c8e8e8%3A0x8e8e8e8e8e8e8e8e!2sVaidoto%20g.%201%2C%20Kaunas%2045387!5e0!3m2!1sen!2slt!4v1234567890123!5m2!1sen!2slt"
                                    width="100%"
                                    height="100%"
                                    style={{ border: 0 }}
                                    allowFullScreen
                                    loading="lazy"
                                    referrerPolicy="no-referrer-when-downgrade"
                                    className="w-full h-full"
                                    title="Shop Natural Location"
                                />
                            </div>
                        </div>

                        {/* Contact Form - Shown second on mobile, right on desktop */}
                        <div className="order-1 lg:order-2">
                            <div className="rounded-2xl border-2 border-border bg-background p-6 md:p-8 h-full">
                                <div className="mb-6">
                                    <h2 className="text-2xl font-bold uppercase tracking-wide text-foreground md:text-3xl">
                                        {t('contact.form_title', 'Send us a Message')}
                                    </h2>
                                    <p className="mt-2 text-sm text-muted-foreground md:text-base">
                                        {t('contact.form_description', 'Have a question or need assistance? Fill out the form below and we will get back to you as soon as possible.')}
                                    </p>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Success Message */}
                                {isSuccess && (
                                    <div className="flex items-center gap-3 rounded-lg border-2 border-gold bg-gold/5 p-4">
                                        <CheckCircle2 className="size-5 shrink-0 text-gold" />
                                        <p className="text-sm font-medium text-foreground">
                                            {t('contact.success_message', 'Thank you for your message! We will get back to you soon.')}
                                        </p>
                                    </div>
                                )}

                                {/* Name and Email Row */}
                                <div className="grid gap-6 md:grid-cols-2">
                                    {/* Name Field */}
                                    <div>
                                        <Label htmlFor="name" className="text-sm font-bold uppercase tracking-wide">
                                            {t('contact.name', 'Name')} *
                                        </Label>
                                        <Input
                                            id="name"
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => handleChange('name', e.target.value)}
                                            placeholder={t('contact.name_placeholder', 'Your name')}
                                            className="mt-1.5"
                                            error={errors.name}
                                            disabled={isSubmitting}
                                        />
                                        {errors.name && (
                                            <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                                        )}
                                    </div>

                                    {/* Email Field */}
                                    <div>
                                        <Label htmlFor="email" className="text-sm font-bold uppercase tracking-wide">
                                            {t('checkout.email', 'Email')} *
                                        </Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => handleChange('email', e.target.value)}
                                            placeholder={t('contact.email_placeholder', 'your@email.com')}
                                            className="mt-1.5"
                                            error={errors.email}
                                            disabled={isSubmitting}
                                        />
                                        {errors.email && (
                                            <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                                        )}
                                    </div>
                                </div>

                                {/* Subject Field */}
                                <div>
                                    <Label htmlFor="subject" className="text-sm font-bold uppercase tracking-wide">
                                        {t('contact.subject', 'Subject')} *
                                    </Label>
                                    <Input
                                        id="subject"
                                        type="text"
                                        value={formData.subject}
                                        onChange={(e) => handleChange('subject', e.target.value)}
                                        placeholder={t('contact.subject_placeholder', 'What is this regarding?')}
                                        className="mt-1.5"
                                        error={errors.subject}
                                        disabled={isSubmitting}
                                    />
                                    {errors.subject && (
                                        <p className="mt-1 text-sm text-red-600">{errors.subject}</p>
                                    )}
                                </div>

                                {/* Message Field */}
                                <div>
                                    <Label htmlFor="message" className="text-sm font-bold uppercase tracking-wide">
                                        {t('contact.message', 'Message')} *
                                    </Label>
                                    <Textarea
                                        id="message"
                                        value={formData.message}
                                        onChange={(e) => handleChange('message', e.target.value)}
                                        placeholder={t('contact.message_placeholder', 'Tell us more about your inquiry...')}
                                        className="mt-1.5 min-h-32 resize-none rounded-lg border-2 transition-all focus-visible:border-gold focus-visible:ring-gold/50"
                                        disabled={isSubmitting}
                                    />
                                    <div className="mt-1 flex items-center justify-between">
                                        {errors.message ? (
                                            <p className="text-sm text-red-600">{errors.message}</p>
                                        ) : (
                                            <p className="text-xs text-muted-foreground">
                                                {formData.message.length}/1000
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Submit Button */}
                                <Button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full bg-gold hover:bg-gold/90 md:w-auto md:px-8"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="mr-2 size-5 animate-spin" />
                                            {t('contact.sending', 'Sending...')}
                                        </>
                                    ) : (
                                        <>
                                            <Send className="mr-2 size-5" />
                                            {t('contact.send_message', 'Send Message')}
                                        </>
                                    )}
                                </Button>
                            </form>
                            </div>
                        </div>
                    </div>

                    {/* Contact Cards */}
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                        {contactInfo.map((section, index) => {
                            const Icon = section.icon;
                            return (
                                <div
                                    key={index}
                                    className="rounded-2xl border-2 border-border bg-background p-6 md:p-8 transition-all duration-300 hover:border-gold/40 hover:shadow-lg hover:shadow-gold/10"
                                >
                                    {/* Icon */}
                                    <div className="mb-4 inline-flex rounded-full bg-gold/10 p-3">
                                        <Icon className="size-6 text-gold" />
                                    </div>

                                    {/* Title */}
                                    <h2 className="mb-4 text-xl font-bold uppercase tracking-wide text-foreground">
                                        {section.title}
                                    </h2>

                                    {/* Contact Items */}
                                    <div className="space-y-3">
                                        {section.items.map((item, itemIndex) => (
                                            <div key={itemIndex} className="space-y-1">
                                                <p className="text-sm font-medium text-muted-foreground">
                                                    {item.label}
                                                </p>
                                                {item.type === 'link' ? (
                                                    <a
                                                        href={item.href}
                                                        className="block text-base font-medium text-foreground transition-colors duration-300 hover:text-gold"
                                                    >
                                                        {item.value}
                                                    </a>
                                                ) : (
                                                    <p className="text-base text-foreground">
                                                        {item.value}
                                                    </p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <Footer />
            </div>
        </>
    );
}
