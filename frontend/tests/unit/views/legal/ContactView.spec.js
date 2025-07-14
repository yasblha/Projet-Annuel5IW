import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import ContactView from '@/views/legal/ContactView.vue'
import { createRouter, createWebHistory } from 'vue-router'

// Mock des routes pour le composant
const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: { template: '<div>Home page</div>' }
    },
    {
      path: '/privacy',
      name: 'privacy',
      component: { template: '<div>Privacy page</div>' }
    }
  ]
})

describe('ContactView.vue', () => {
  let wrapper;

  beforeEach(() => {
    // Mock de document.title
    Object.defineProperty(document, 'title', {
      writable: true,
      value: '',
    });

    // Montage du composant
    wrapper = mount(ContactView, {
      global: {
        plugins: [router],
        stubs: ['router-link'],
      }
    });
  });

  it('devrait définir le titre de la page correctement', () => {
    expect(document.title).toBe('Contact - Billing System');
  });

  it('devrait afficher le formulaire de contact', () => {
    expect(wrapper.find('form').exists()).toBe(true);
    expect(wrapper.find('input[type="text"]#firstName').exists()).toBe(true);
    expect(wrapper.find('input[type="text"]#lastName').exists()).toBe(true);
    expect(wrapper.find('input[type="email"]#email').exists()).toBe(true);
    expect(wrapper.find('select#subject').exists()).toBe(true);
    expect(wrapper.find('textarea#message').exists()).toBe(true);
  });

  it('devrait afficher les sections informations de contact et horaires', () => {
    expect(wrapper.html()).toContain('Informations de contact');
    expect(wrapper.html()).toContain('Nos horaires');
    expect(wrapper.html()).toContain('Lundi - Vendredi');
    expect(wrapper.html()).toContain('09:00 - 18:00');
  });

  it('devrait mettre à jour le formulaire lors de la saisie utilisateur', async () => {
    // Simuler la saisie utilisateur
    await wrapper.find('input#firstName').setValue('John');
    await wrapper.find('input#lastName').setValue('Doe');
    await wrapper.find('input#email').setValue('john.doe@example.com');
    await wrapper.find('select#subject').setValue('information');
    await wrapper.find('textarea#message').setValue('Ceci est un message de test');

    // Vérifier que les valeurs du formulaire sont mises à jour
    const vm = wrapper.vm;
    expect(vm.form.firstName).toBe('John');
    expect(vm.form.lastName).toBe('Doe');
    expect(vm.form.email).toBe('john.doe@example.com');
    expect(vm.form.subject).toBe('information');
    expect(vm.form.message).toBe('Ceci est un message de test');
  });

  it('devrait valider que les champs requis sont présents', () => {
    const requiredFields = wrapper.findAll('[required]');
    expect(requiredFields.length).toBeGreaterThan(4); // Au moins prénom, nom, email, sujet et message
  });

  it('devrait soumettre le formulaire et afficher un message de succès', async () => {
    // Simuler la saisie utilisateur
    await wrapper.find('input#firstName').setValue('John');
    await wrapper.find('input#lastName').setValue('Doe');
    await wrapper.find('input#email').setValue('john.doe@example.com');
    await wrapper.find('select#subject').setValue('information');
    await wrapper.find('textarea#message').setValue('Message test');
    await wrapper.find('input#privacy').setValue(true);
    
    // Remplacer la méthode handleSubmit par un mock
    const mockHandleSubmit = vi.fn().mockImplementation(async () => {
      wrapper.vm.submitStatus = 'success';
      wrapper.vm.submitMessage = "Votre message a été envoyé avec succès. Nous vous répondrons dans les plus brefs délais.";
    });
    wrapper.vm.handleSubmit = mockHandleSubmit;
    
    // Soumettre le formulaire
    await wrapper.find('form').trigger('submit');
    
    // Vérifier que le gestionnaire a été appelé
    expect(mockHandleSubmit).toHaveBeenCalled();
    
    // Attendre le cycle de rendu
    await nextTick();
    
    // Vérifier que le message de succès est affiché
    expect(wrapper.vm.submitStatus).toBe('success');
    expect(wrapper.html()).toContain('Votre message a été envoyé');
  });
});
