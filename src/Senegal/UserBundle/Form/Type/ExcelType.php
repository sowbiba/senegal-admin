<?php

namespace Pfd\ContractBundle\Form\Type;

use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolverInterface;

/**
 * Class ExcelType
 */
class ExcelType extends AbstractType
{
    /**
     * @param FormBuilderInterface $builder
     * @param array                $options
     */
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder->add('file', 'file',
            array('label'  => 'Fichier (Excel uniquement)',
                'attr'     => ['class'  => 'import-file col-12 filter-file form-control jquery-file-upload']
                )
            );
    }

    /**
     * {@inheritdoc}
     */
    public function getName()
    {
        return 'excel';
    }

    /**
     * @param OptionsResolverInterface $resolver
     */
    public function setDefaultOptions(OptionsResolverInterface $resolver)
    {
        $resolver->setDefaults(array(
            'csrf_protection' => false,
        ));
    }
}
