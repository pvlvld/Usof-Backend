import type { NextFunction, Request, Response } from "express";
import { CollectionService } from "./collection.service.js";
import { plainToInstance } from "class-transformer";
import {
  CreateCollectionDTO,
  UpdateCollectionDTO,
  CollectionNameDTO,
  PostIdDTO
} from "./collection.dto.js";
import { validate } from "class-validator";
import { UnauthorizedError } from "../../shared/consts/errors.js";

class CollectionController {
  private collectionService: CollectionService;

  constructor() {
    this.collectionService = CollectionService.getInstance();
  }

  public async createCollection(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const dto = plainToInstance(CreateCollectionDTO, req.body);
    const errors = await validate(dto);
    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    if (!req.user) {
      return next(new UnauthorizedError());
    }

    try {
      const collection = await this.collectionService.createCollection(
        req.user.id,
        dto
      );
      return res.status(201).json(collection);
    } catch (error) {
      return next(error);
    }
  }

  public async getCollections(req: Request, res: Response, next: NextFunction) {
    if (!req.user) {
      return next(new UnauthorizedError());
    }

    try {
      const collections = await this.collectionService.getCollections(
        req.user.id
      );
      return res.json(collections);
    } catch (error) {
      return next(error);
    }
  }

  public async getCollectionByName(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const dto = plainToInstance(CollectionNameDTO, req.params);
    const errors = await validate(dto);
    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    if (!req.user) {
      return next(new UnauthorizedError());
    }

    try {
      const collection = await this.collectionService.getCollectionByName(
        req.user.id,
        dto
      );
      return res.json(collection);
    } catch (error) {
      return next(error);
    }
  }

  public async getCollectionWithPosts(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const dto = plainToInstance(CollectionNameDTO, req.params);
    const errors = await validate(dto);
    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    if (!req.user) {
      return next(new UnauthorizedError());
    }

    try {
      const collection = await this.collectionService.getCollectionWithPosts(
        req.user.id,
        dto
      );
      return res.json(collection);
    } catch (error) {
      return next(error);
    }
  }

  public async updateCollection(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const nameDto = plainToInstance(CollectionNameDTO, req.params);
    const bodyDto = plainToInstance(UpdateCollectionDTO, req.body);

    const nameErrors = await validate(nameDto);
    const bodyErrors = await validate(bodyDto);

    if (nameErrors.length > 0 || bodyErrors.length > 0) {
      return res.status(400).json({ errors: [...nameErrors, ...bodyErrors] });
    }

    if (!req.user) {
      return next(new UnauthorizedError());
    }

    try {
      const collection = await this.collectionService.updateCollection(
        req.user.id,
        nameDto,
        bodyDto
      );
      return res.json(collection);
    } catch (error) {
      return next(error);
    }
  }

  public async deleteCollection(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const dto = plainToInstance(CollectionNameDTO, req.params);
    const errors = await validate(dto);
    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    if (!req.user) {
      return next(new UnauthorizedError());
    }

    try {
      const result = await this.collectionService.deleteCollection(
        req.user.id,
        dto
      );
      return res.json(result);
    } catch (error) {
      return next(error);
    }
  }

  public async addPostToCollection(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const nameDto = plainToInstance(CollectionNameDTO, req.params);
    const postDto = plainToInstance(PostIdDTO, req.body);

    const nameErrors = await validate(nameDto);
    const postErrors = await validate(postDto);

    if (nameErrors.length > 0 || postErrors.length > 0) {
      return res.status(400).json({ errors: [...nameErrors, ...postErrors] });
    }

    if (!req.user) {
      return next(new UnauthorizedError());
    }

    try {
      const result = await this.collectionService.addPostToCollection(
        req.user.id,
        nameDto,
        postDto
      );
      return res.status(201).json(result);
    } catch (error) {
      return next(error);
    }
  }

  public async removePostFromCollection(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const nameDto = plainToInstance(CollectionNameDTO, req.params);
    const postDto = plainToInstance(PostIdDTO, req.params);

    const nameErrors = await validate(nameDto);
    const postErrors = await validate(postDto);

    if (nameErrors.length > 0 || postErrors.length > 0) {
      return res.status(400).json({ errors: [...nameErrors, ...postErrors] });
    }

    if (!req.user) {
      return next(new UnauthorizedError());
    }

    try {
      const result = await this.collectionService.removePostFromCollection(
        req.user.id,
        nameDto,
        postDto
      );
      return res.json(result);
    } catch (error) {
      return next(error);
    }
  }
}

export const collectionController = new CollectionController();
