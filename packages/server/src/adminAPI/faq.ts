import { Faq } from '../models/Faq.js';
import { crud } from './crud.js';
import { mikroCrud } from './mikroCrud.js';

export const faqHandler = crud('/faqs', mikroCrud({ entity: Faq }));
