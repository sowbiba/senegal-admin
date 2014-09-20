<?php

namespace Pfd\ContractBundle\Form\Type;

use Pfd\SdkBundle\Validator\Constraints\RevisionConstraint;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\Options;
use Symfony\Component\OptionsResolver\OptionsResolverInterface;
use Pfd\ContractBundle\Subscriber\DynamicFieldSubscriber;

/**
 * Class DynamicFormType
 */
class DynamicFormType extends AbstractType
{
    /**
     * Delegate the build of form to DynamicFieldSubscriber
     *
     * @param FormBuilderInterface $builder
     * @param array                $options
     */
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder->addEventSubscriber(new DynamicFieldSubscriber(
            $builder->getFormFactory(),
            $options['fields'],
            $options['values'],
            $options['revision']
        ));

        $contract = $options['revision']->getContract();

        // Disable submit if revision is cloned or contract revision is a child
        $attr = $options['revision']->isCloned() ? ['disabled' => 'disabled'] : [];

        $builder->add('save', 'submit', ['label' => 'Sauvegarder les modifications de la révision', 'attr' => $attr]);
        $builder->add('submit', 'submit', ['label' => 'Soumettre la révision', 'attr' => $attr]);
        $builder->add('reject', 'submit', ['label' => 'Rejeter la révision', 'attr' => $attr]);
        $builder->add('valid', 'submit', ['label' => 'Valider la révision', 'attr' => $attr]);
        $builder->add('unpublish', 'submit', ['label' => 'Dé-publier la révision', 'attr' => $attr]);

        // Disable publish submit only if revision is in a child contract. Do not disable for cloned revision
        $attr = $contract->isChild() ? ['disabled' => 'disabled'] : [];

        $builder->add('publish', 'submit', ['label' => 'Publier la révision', 'attr' => $attr]);
    }

    /**
     * @return string
     */
    public function getName()
    {
        return 'dynamic';
    }

    /**
     * @param OptionsResolverInterface $resolver
     */
    public function setDefaultOptions(OptionsResolverInterface $resolver)
    {
        $resolver->setDefaults(array(
            'csrf_protection' => false,
            'constraints'     => function (Options $options) {
                return new RevisionConstraint($options['revision']);
            },
            'error_bubbling'  => false,
            'fields'          => array(),
            'values'          => array(),
            'revision'        => null,
            'contract'        => null
        ));
    }
}
