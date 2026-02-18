import React, { useState } from 'react';
import {
    Button, Input, Modal, useToast, ToastContainer, Card, StatCard,
    Badge, Table, Dropdown, ProgressBar, CircularProgress, Tooltip,
    Avatar, AvatarGroup, Switch, Stepper, Spinner, Alert, FileUpload,
    Tabs, DatePicker, Carousel, Timer, Countdown, Form, Textarea,
    Checkbox, RadioGroup, Accordion, Breadcrumb, Popover, Drawer,
    EmptyState, Divider, Skeleton
} from '../components/ui';
import {
    User, Mail, Send, Plus, Download, Settings, Bell,
    FileText, Calendar as CalendarIcon, Icon
} from 'lucide-react';

const UIShowcase = () => {
    const [modalOpen, setModalOpen] = useState(false);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [switchChecked, setSwitchChecked] = useState(false);
    const [selectedDate, setSelectedDate] = useState(null);
    const [currentStep, setCurrentStep] = useState(1);

    const { toasts, addToast, removeToast } = useToast();

    const tableColumns = [
        { key: 'name', header: 'Nom', sortable: true },
        { key: 'email', header: 'Email' },
        {
            key: 'status',
            header: 'Statut',
            render: (value) => <Badge variant={value === 'Actif' ? 'success' : 'danger'}>{value}</Badge>
        }
    ];

    const tableData = [
        { name: 'John Doe', email: 'john@example.com', status: 'Actif' },
        { name: 'Jane Smith', email: 'jane@example.com', status: 'Inactif' },
    ];

    return (
        <div className="max-w-7xl mx-auto p-6 space-y-12">
            <ToastContainer toasts={toasts} removeToast={removeToast} />

            <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">UI Components Library</h1>
                <p className="text-gray-600">Bibliothèque complète de composants réutilisables</p>
            </div>

            {/* Buttons */}
            <section>
                <h2 className="text-2xl font-bold mb-4">Buttons</h2>
                <div className="flex flex-wrap gap-4">
                    <Button variant="primary">Primary</Button>
                    <Button variant="secondary">Secondary</Button>
                    <Button variant="success">Success</Button>
                    <Button variant="danger">Danger</Button>
                    <Button variant="warning">Warning</Button>
                    <Button variant="outline">Outline</Button>
                    <Button variant="ghost">Ghost</Button>
                    <Button loading>Loading</Button>
                    <Button leftIcon={<Plus className="w-4 h-4" />}>With Icon</Button>
                </div>
            </section>

            <Divider />
            <Divider>OU</Divider>
            <Divider orientation="vertical" />

            {/* Inputs */}
            <section>
                <h2 className="text-2xl font-bold mb-4">Inputs</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
                    <Input label="Email" type="email" placeholder="email@example.com" />
                    <Input label="Password" type="password" placeholder="••••••••" />
                    <Input label="With Icon" leftIcon={<Mail className="w-5 h-5 text-gray-400" />} />
                    <Input label="With Error" error="Ce champ est requis" />
                </div>
            </section>

            <Divider />
            <Timer
                duration={60}
                autoStart
                onComplete={() => alert('Terminé!')}
                showControls
                format="mm:ss"
            />

            <Countdown
                targetDate={new Date('2026-12-31')}
                onComplete={() => console.log('Terminé!')}
            />
            <Carousel
                items={[
                    <img src="/slide1.jpg" />,
                    <img src="/slide2.jpg" />,
                    <img src="/slide3.jpg" />
                ]}
                autoPlay
                interval={3000}
                showIndicators
                showControls
            />

            {/* Cards */}
            <section>
                <h2 className="text-2xl font-bold mb-4">Cards</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card title="Card Title" subtitle="Subtitle">
                        Card content goes here
                    </Card>

                    <StatCard
                        icon={<User className="w-6 h-6" />}
                        label="Total Users"
                        value="1,234"
                        trend="up"
                        trendValue="+12%"
                        color="blue"
                    />

                    <Card hoverable>
                        <p>Hoverable card</p>
                    </Card>
                </div>
            </section>

            <Divider />

            {/* Badges */}
            <section>
                <h2 className="text-2xl font-bold mb-4">Badges</h2>
                <div className="flex flex-wrap gap-3">
                    <Badge variant="default">Default</Badge>
                    <Badge variant="primary">Primary</Badge>
                    <Badge variant="success">Success</Badge>
                    <Badge variant="danger">Danger</Badge>
                    <Badge variant="warning">Warning</Badge>
                    <Badge variant="info">Info</Badge>
                    <Badge variant="outline">Outline</Badge>
                </div>
            </section>

            <Divider />

            {/* Table */}
            <section>
                <h2 className="text-2xl font-bold mb-4">Table</h2>
                <Table
                    columns={tableColumns}
                    data={tableData}
                    sortable
                    hoverable
                />
            </section>

            <Divider />

            {/* Progress Bars */}
            <section>
                <h2 className="text-2xl font-bold mb-4">Progress Bars</h2>
                <div className="space-y-4 max-w-2xl">
                    <ProgressBar value={75} label="Progression" />
                    <ProgressBar value={50} color="green" />
                    <div className="flex justify-center">
                        <CircularProgress value={65} />
                    </div>
                </div>
            </section>

            <Divider />

            {/* Avatars */}
            <section>
                <h2 className="text-2xl font-bold mb-4">Avatars</h2>
                <div className="flex items-center gap-6">
                    <Avatar name="John Doe" size="sm" />
                    <Avatar name="Jane Smith" size="md" status="online" />
                    <Avatar name="Bob Johnson" size="lg" />
                    <AvatarGroup
                        avatars={[
                            { name: 'User 1' },
                            { name: 'User 2' },
                            { name: 'User 3' },
                            { name: 'User 4' }
                        ]}
                        max={3}
                    />
                </div>
            </section>

            <Divider />

            {/* Alerts */}
            <section>
                <h2 className="text-2xl font-bold mb-4">Alerts</h2>
                <div className="space-y-4 max-w-2xl">
                    <Alert variant="success" title="Succès!">
                        Opération effectuée avec succès
                    </Alert>
                    <Alert variant="error" title="Erreur!" closable>
                        Une erreur est survenue
                    </Alert>
                    <Alert variant="warning">
                        Attention, cette action est irréversible
                    </Alert>
                    <Alert variant="info">
                        Information importante à noter
                    </Alert>
                </div>
            </section>

            <Divider />

            {/* Stepper */}
            <section>
                <h2 className="text-2xl font-bold mb-4">Stepper</h2>
                <Stepper
                    steps={[
                        { title: 'Étape 1', description: 'Configuration' },
                        { title: 'Étape 2', description: 'Informations' },
                        { title: 'Étape 3', description: 'Validation' }
                    ]}
                    currentStep={currentStep}
                    onStepClick={setCurrentStep}
                />
            </section>

            <Divider />

            {/* Tabs */}
            <section>
                <h2 className="text-2xl font-bold mb-4">Tabs</h2>
                <Tabs
                    tabs={[
                        { label: 'Tab 1', content: <div className="p-4">Contenu Tab 1</div> },
                        { label: 'Tab 2', badge: 5, content: <div className="p-4">Contenu Tab 2</div> },
                        { label: 'Tab 3', content: <div className="p-4">Contenu Tab 3</div> }
                    ]}
                    variant="underline"
                />
            </section>

            <Divider />

            {/* Accordion */}
            <section>
                <h2 className="text-2xl font-bold mb-4">Accordion</h2>
                <Accordion
                    items={[
                        {
                            title: 'Section 1',
                            content: <div className="p-4">Contenu de la section 1</div>
                        },
                        {
                            title: 'Section 2',
                            content: <div className="p-4">Contenu de la section 2</div>
                        }
                    ]}
                />
            </section>

            <Divider />

            {/* Modal & Drawer */}
            <section>
                <h2 className="text-2xl font-bold mb-4">Modal & Drawer</h2>
                <div className="flex gap-4">
                    <Button onClick={() => setModalOpen(true)}>
                        Ouvrir Modal
                    </Button>
                    <Button onClick={() => setDrawerOpen(true)}>
                        Ouvrir Drawer
                    </Button>
                    <Button onClick={() => addToast('Notification test!', 'success')}>
                        Afficher Toast
                    </Button>
                </div>

                <Modal
                    isOpen={modalOpen}
                    onClose={() => setModalOpen(false)}
                    title="Exemple Modal"
                    footer={
                        <>
                            <Button variant="outline" onClick={() => setModalOpen(false)}>
                                Annuler
                            </Button>
                            <Button onClick={() => setModalOpen(false)}>
                                Confirmer
                            </Button>
                        </>
                    }
                >
                    <p>Ceci est un exemple de contenu modal.</p>
                </Modal>

                <Drawer
                    isOpen={drawerOpen}
                    onClose={() => setDrawerOpen(false)}
                    title="Exemple Drawer"
                    footer={
                        <Button fullWidth onClick={() => setDrawerOpen(false)}>
                            Fermer
                        </Button>
                    }
                >
                    <p>Contenu du drawer</p>
                </Drawer>
            </section>

            <Divider />

            {/* Empty State */}
            <section>
                <h2 className="text-2xl font-bold mb-4">Empty State</h2>
                <Card>
                    <EmptyState
                        icon={<FileText className="w-16 h-16" />}
                        title="Aucun document"
                        description="Commencez par créer votre premier document"
                        action={<Button leftIcon={<Plus className="w-4 h-4" />}>Créer un document</Button>}
                    />
                </Card>
            </section>
            <Alert
                variant="info"
                title="Info!"
                closable
                onClose={() => {}}
            >
                Opération effectuée avec succès
            </Alert>
            <Divider />
            <Spinner size="md" color="cyan" text="Chargement..." />

            {/* Other Components   <Spinner fullScreen text="Chargement de la page..." />*/}

            <Skeleton width="100%" height="20px" count={2} />


            <section>

                <h2 className="text-2xl font-bold mb-4">Autres Composants</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <h3 className="font-semibold mb-2">Switch</h3>
                        <Switch
                            checked={switchChecked}
                            onChange={setSwitchChecked}
                            label="Activer les notifications"
                        />
                    </div>

                    <div>
                        <h3 className="font-semibold mb-2">Spinner</h3>
                        <Spinner size="md" text="Chargement..." />
                    </div>

                    <div>
                        <h3 className="font-semibold mb-2">Breadcrumb</h3>
                        <Breadcrumb
                            items={[
                                { label: 'Dashboard', href: '/' },
                                { label: 'Users', href: '/users' },
                                { label: 'John Doe' }
                            ]}
                        />
                    </div>

                    <div>
                        <h3 className="font-semibold mb-2">Tooltip</h3>
                        <Tooltip content="Ceci est une info-bulle">
                            <Button>Hover me</Button>
                        </Tooltip>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default UIShowcase;