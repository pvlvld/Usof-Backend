import { CollectionModel } from "./collection.model.js";
import type {
  CreateCollectionDTO,
  UpdateCollectionDTO,
  CollectionNameDTO,
  PostIdDTO
} from "./collection.dto.js";
import {
  NotFoundError,
  ConflictError,
  BadRequestError
} from "../../shared/consts/errors.js";

export class CollectionService {
  private static instance: CollectionService | null = null;
  private collectionModel: CollectionModel;

  private constructor() {
    this.collectionModel = CollectionModel.getInstance();
  }

  public static getInstance() {
    if (!this.instance) {
      this.instance = new CollectionService();
    }
    return this.instance;
  }

  public async createCollection(userId: number, dto: CreateCollectionDTO) {
    // Check if collection with this name already exists for the user
    const existingCollection = await this.collectionModel.getCollectionByName(
      userId,
      dto.name
    );
    if (existingCollection) {
      throw new ConflictError(
        `Collection with name "${dto.name}" already exists`
      );
    }

    const collection = await this.collectionModel.createCollection(userId, dto);
    if (!collection) {
      throw new BadRequestError("Failed to create collection");
    }

    return collection;
  }

  public async getCollections(userId: number) {
    return await this.collectionModel.getCollectionsByUserId(userId);
  }

  public async getCollectionByName(userId: number, dto: CollectionNameDTO) {
    const collection = await this.collectionModel.getCollectionByName(
      userId,
      dto.collection_name
    );
    if (!collection) {
      throw new NotFoundError(`Collection "${dto.collection_name}" not found`);
    }

    return collection;
  }

  public async getCollectionWithPosts(userId: number, dto: CollectionNameDTO) {
    const collection = await this.collectionModel.getCollectionWithPosts(
      userId,
      dto.collection_name
    );
    if (!collection) {
      throw new NotFoundError(`Collection "${dto.collection_name}" not found`);
    }

    return collection;
  }

  public async updateCollection(
    userId: number,
    dto: CollectionNameDTO,
    updateDto: UpdateCollectionDTO
  ) {
    // Check if collection exists
    const existingCollection = await this.collectionModel.getCollectionByName(
      userId,
      dto.collection_name
    );
    if (!existingCollection) {
      throw new NotFoundError(`Collection "${dto.collection_name}" not found`);
    }

    // If updating name, check if new name already exists
    if (updateDto.name && updateDto.name !== dto.collection_name) {
      const nameExists = await this.collectionModel.getCollectionByName(
        userId,
        updateDto.name
      );
      if (nameExists) {
        throw new ConflictError(
          `Collection with name "${updateDto.name}" already exists`
        );
      }
    }

    const updatedCollection = await this.collectionModel.updateCollection(
      userId,
      dto.collection_name,
      updateDto
    );
    if (!updatedCollection) {
      throw new BadRequestError("Failed to update collection");
    }

    return updatedCollection;
  }

  public async deleteCollection(userId: number, dto: CollectionNameDTO) {
    const success = await this.collectionModel.deleteCollection(
      userId,
      dto.collection_name
    );
    if (!success) {
      throw new NotFoundError(`Collection "${dto.collection_name}" not found`);
    }

    return {
      message: `Collection "${dto.collection_name}" deleted successfully`
    };
  }

  public async addPostToCollection(
    userId: number,
    dto: CollectionNameDTO,
    postDto: PostIdDTO
  ) {
    // Check if collection exists
    const collection = await this.collectionModel.getCollectionByName(
      userId,
      dto.collection_name
    );
    if (!collection) {
      throw new NotFoundError(`Collection "${dto.collection_name}" not found`);
    }

    const success = await this.collectionModel.addPostToCollection(
      userId,
      dto.collection_name,
      postDto.post_id
    );
    if (!success) {
      throw new BadRequestError(
        "Failed to add post to collection. Post may not exist or already be in the collection."
      );
    }

    return {
      message: `Post ${postDto.post_id} added to collection "${dto.collection_name}"`
    };
  }

  public async removePostFromCollection(
    userId: number,
    dto: CollectionNameDTO,
    postDto: PostIdDTO
  ) {
    // Check if collection exists
    const collection = await this.collectionModel.getCollectionByName(
      userId,
      dto.collection_name
    );
    if (!collection) {
      throw new NotFoundError(`Collection "${dto.collection_name}" not found`);
    }

    const success = await this.collectionModel.removePostFromCollection(
      userId,
      dto.collection_name,
      postDto.post_id
    );
    if (!success) {
      throw new BadRequestError(
        "Failed to remove post from collection. Post may not be in the collection."
      );
    }

    return {
      message: `Post ${postDto.post_id} removed from collection "${dto.collection_name}"`
    };
  }
}
