/**
 * Helper formatter to map requirement types and category labels (e.g. "PRODUCT / ITEM", "APPLICATION / ENVIRONMENT")
 * returned from backend extraction to localized translation strings.
 */
export function formatRequirementType(rawType: string | undefined | null, t: (key: string) => string): string {
  if (!rawType) return '';

  const clean = rawType.toUpperCase().trim();

  if (clean.includes('PRODUCT') || clean.includes('ITEM')) {
    return t('requirement.product');
  }
  if (clean.includes('APPLICATION')) {
    return t('requirement.application');
  }
  if (clean.includes('ENVIRONMENT')) {
    return t('requirement.environment');
  }
  if (clean.includes('PERFORMANCE')) {
    return t('requirement.performance');
  }
  if (clean.includes('SAFETY')) {
    return t('requirement.safety');
  }
  if (clean.includes('TESTING')) {
    return t('requirement.testing');
  }
  if (clean.includes('INSTALLATION')) {
    return t('requirement.installation');
  }
  if (clean.includes('CATEGORY')) {
    return t('requirement.category');
  }
  if (clean.includes('DOMAIN')) {
    return t('requirement.domain');
  }
  if (clean.includes('SCOPE')) {
    return t('requirement.scope');
  }

  return rawType;
}

/**
 * Helper formatter to map match reason codes to localized translation strings.
 */
export function formatReasonLabel(reasonCode: string | undefined | null, t: (key: string) => string): string {
  if (!reasonCode) return t('results.matchedBecause');

  const clean = reasonCode.toUpperCase().trim();

  if (clean === 'SCOPE_MATCH' || clean.includes('SCOPE')) {
    return t('requirement.scope') + ' Match';
  }
  if (clean === 'PRODUCT_TITLE_MATCH' || clean.includes('PRODUCT') || clean.includes('TITLE')) {
    return t('requirement.product') + ' Match';
  }
  if (clean === 'CATEGORY_DOMAIN_MATCH' || clean.includes('CATEGORY') || clean.includes('DOMAIN')) {
    return t('requirement.category') + ' Match';
  }
  if (clean === 'ACTIVE_VERSION' || clean.includes('VERSION')) {
    return t('status.current');
  }

  return reasonCode;
}
