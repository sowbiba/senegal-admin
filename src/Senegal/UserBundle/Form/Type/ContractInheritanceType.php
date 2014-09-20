<?php

namespace Pfd\ContractBundle\Form\Type;

use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolverInterface;
use Symfony\Component\Routing\Router;

class ContractInheritanceType extends AbstractType
{

    /**
     * @var Router
     */
    private $router;

    /**
     * @param Router
     */
    public function __construct(Router $router)
    {
        $this->router = $router;
    }
    
    /**
     * @param FormBuilderInterface $builder
     * @param array                $options
     */
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder->setAction($this->router->generate('pdf_contract_save_inheritance', ['id' => $options['contract']->getId()]));

        $builder->add(
            'parent', 'sdk_model', [
                'label'    => 'Contrat père',
                'choices'  => $options['contracts'],
                'data'     => $parent = $options['contract']->getParent(),
                'attr'     => null !== $parent ? ['disabled' => true] : [],
                'required' => false,
            ]
        );

        $builder->add(
            'inherited_chapters', 'sdk_model', [
                'label'    => 'Chapitres hérités',
                'choices'  => $options['contract']->getProductLine()->getFirstChapterLevel(),
                'required' => false,
                'multiple' => true,
                'expanded' => true,
                'data'     => $options['contract']->getInheritedChapters(),
            ]
        );

        $builder->add('inherit_funds', 'checkbox',
            [
                'label'    => 'Lier les fonds',
                'required' => false,
                'data'    => $options['contract']->inheritsFunds()
            ]);

        $builder->add('inherit_docs', 'checkbox',
            [
                'label'    => 'Lier la documentation ',
                'required' => false,
                'data'     => $options['contract']->inheritsDocuments(),
                'attr'     => $options['contract']->getProductLine()->isRevisionable() ? ['disabled' => true] : [],
            ]);

        $builder->add('save', 'submit', ['label' => 'Sauvegarder', 'attr' => ['class' => 'btn btn-primary form-row-hidden']]);
    }

    /**
     * {@inheritdoc}
     */
    public function getName()
    {
        return 'contract_inheritance';
    }

    /**
     * @param OptionsResolverInterface $resolver
     */
    public function setDefaultOptions(OptionsResolverInterface $resolver)
    {
        $resolver->setDefaults(array(
            'csrf_protection' => false,
            'contracts' => [],
            'contract' => [],
            'method' => 'POST',
            'label' => 'Héritage',
        ));
    }
}
