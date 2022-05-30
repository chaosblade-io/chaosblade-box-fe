import createServiceChaos from 'utils/createServiceChaos';
import { BaseModel, dvaModel, effect } from 'utils/libs/sre-utils-dva';
import { ICategoryEditorParams } from 'config/interfaces/Chaos/scene';

@dvaModel('category')
class Category extends BaseModel {

  @effect()
  *addCategory(payload: ICategoryEditorParams) {
    return yield this.effects.call(createServiceChaos('AddCategory'), payload);
  }

  @effect()
  *updateCategory(payload: ICategoryEditorParams) {
    return yield this.effects.call(createServiceChaos('UpdateCategory'), payload);
  }

  @effect()
  *deleteCategory(payload: ICategoryEditorParams) {
    return yield this.effects.call(createServiceChaos('DeleteCategory'), payload);
  }

}

export default new Category().model;

declare global {
  interface Actions {
    category: Category;
  }
}
